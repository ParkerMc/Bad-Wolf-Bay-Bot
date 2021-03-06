'use strict';

var events = require('events');
const fs = require('fs');
const path = require('path');
const opus = require('node-opus');
const child_process = require('child_process');
var archiver = require('archiver');

const rate = 48000;
const frame_size = 1920;
const channels = 2;

let total = 0;
let complete = 0;

var totalFiles = 0;
var wait = true;

const frequency = 48000;

let countDone = (inputDirectory) => {
        var count = 0;
	while (count<totalFiles&&wait) {
		count = 0;
		console.log(count);
		fs.readdir(inputDirectory, (err, files) => {
			files.forEach((file) => {
				let ext = path.extname(file);
				if (ext === '.mp3') {
					count++;
				}
			});
		});
	}
};

let convertOpusStringToRawPCM = (inputPath, filename) => {
	total++;
	let encoder = new opus.OpusEncoder(rate, channels);
	fs.readFile(inputPath, { encoding: 'utf8' }, (err, data) => {
		let frames = data.slice(1).split(','); // Starts with a comma so toss the empty first entry
		let buffers = frames.map(str => {
			return Buffer.from(str, 'hex');
		});
		try {
			buffers = buffers.map(buffer => {
				return encoder.decode(buffer, frame_size);
			});
		} catch (err) {
			try {
				buffers = buffers.map(buffer => {
					return encoder.decode(buffer.slice(8), frame_size);
				});
			} catch (err) {
				console.log(`${filename} was unable to be decoded`);
			}
		}
		let outputStream = fs.createWriteStream(path.join(path.dirname(inputPath), `${filename}.raw_pcm`));
		for (let buffer of buffers) {
			outputStream.write(buffer);
		}
		outputStream.end((err) => {
			if (err) {
				console.error(err);
			}
			complete++;
			console.log(`Completed ${100 * complete / total}%`);
		});
	});
};

var convertAllOpusStringToRawPCM = (inputDirectory) => {
	totalFiles = 0;
	fs.readdir(inputDirectory, (err, files) => {
		files.forEach((file) => {
			let ext = path.extname(file);
			if (ext === '.opus_string') {
				totalFiles++;
				console.log(totalFiles);
				convertOpusStringToRawPCM(path.join(inputDirectory, file), path.basename(file, ext));
			}
		});
	wait = false;
	});
};


// Define functions

let extractUserId = (name) => {
	return name.split('-')[0];
};

let extractTimestamp = (name) => {
	return parseInt(name.split('-')[1], 10);
};

let parseTimeIntoMilliseconds = (timeString) => {
	let intsDec = timeString.split('.');
	let ints = intsDec[0].split(':').map((num) => {
		return parseInt(num, 10);
	}).reverse();

	// Multiply days into hours
	for (let i = 3; i < ints.length; i++) {
		ints[i] *= 24;
	}

	// Multiply hours into minutes
	for (let i = 2; i < ints.length; i++) {
		ints[i] *= 60;
	}

	// Multiply minutes into seconds
	for (let i = 1; i < ints.length; i++) {
		ints[i] *= 60;
	}

	// Multiply seconds into milliseconds
	for (let i = 0; i < ints.length; i++) {
		ints[i] *= 1000;
	}

	let int = ints.reduce((a, b) => {
		return a + b;
	}, 0);

	let dec = 0;
	if (intsDec[1]) {
		dec = parseFloat(`0.${intsDec[1]}`) * 1000;
	}

	return int + dec;
};

let convertDurationToSamples = (duration) => {
	let samples = frequency * duration / 1000;
	let wholeSamples = Math.floor(samples);
	return { samples: wholeSamples, remainder: samples - wholeSamples };
};

let reassemble = (config) => {
	return new Promise((resolve, reject) => {
		let outputPath = path.join(config.id+".mp3");
		let inputCommandArray = [];
		let filterPadCommandArray = [];
		let filterMergeCommandArray = [];
		let inputCommand = '';
		let filterCommand = '';
		let command = '';
		let newCommand = '';

		let commands = [];
		let temporaryOutputPath = `${config.id}-tmp-${commands.length}`;
		let subConfig = {
			id: config.id,
			fragments: []
		};

		for (let fragmentIndex = 0, inputIndex = 0; fragmentIndex < config.fragments.length; fragmentIndex++) {
			let fragment = config.fragments[fragmentIndex];
			inputCommandArray[fragmentIndex] = `-f s16le -ar 48k -ac 2 -i ${fragment.name}`;

			let filterCommands = [];
			if (fragment.totalSampleLength) {
				filterCommands.push(`apad=whole_len=${fragment.totalSampleLength}`);
			}
			if (fragment.delay) {
				filterCommands.push(`adelay=${fragment.delay}|${fragment.delay}`);
			}
			if (filterCommands.length) {
				filterPadCommandArray.push(`[${inputIndex}]${filterCommands.join(',')}[l${inputIndex}]`);
			}
			filterMergeCommandArray[inputIndex] = `[${filterCommands.length ? 'l' : ''}${inputIndex}]`;

			inputCommand = inputCommandArray.join(' ');
			filterCommand = `${filterPadCommandArray.join('; ')}${filterPadCommandArray.length ? '; ' : ''}${filterMergeCommandArray.join('')}concat=n=${inputIndex + 1}:v=0:a=1[a]`;

			newCommand = `ffmpeg -y ${inputCommand} -filter_complex "${filterCommand}" -map "[a]" -f s16le -ar 48k -ac 2 ${temporaryOutputPath}`;
			if (newCommand.length > 8000) {
				commands.push(command);
				subConfig.fragments.push({ name: temporaryOutputPath });
				temporaryOutputPath = `${config.id}-tmp-${commands.length}`;
				inputCommandArray.length = 0;
				filterPadCommandArray.length = 0;
				filterMergeCommandArray.length = 0;
				fragmentIndex--;
				inputIndex = 0;
			} else {
				command = newCommand;
				inputIndex++;
			}
		}

		if (commands.length) {
			commands.push(command);
			subConfig.fragments.push({ name: temporaryOutputPath });
			console.log(commands.length);

			Promise.all(commands.map(command => {
				return doCommand(command);
			})).then(() => {
				reassemble(subConfig).then((code) => {
					resolve(code);
				}).catch(reject);
			}).catch(reject);
		} else {
			command = `ffmpeg -y ${inputCommand} -filter_complex "${filterCommand}" -map "[a]" -acodec libmp3lame ${outputPath}`;
			console.log(command);
			doCommand(command).then(resolve).catch(reject);
		}
	});
};

let doCommand = (command) => {
	return new Promise((resolve, reject) => {
		console.log('new command');
		let child = child_process.spawn(command, { shell: true });
		let string = '';
		child.stderr.on('data', (data) => {
			string += data
		});
		child.on('close', (code) => {
			console.log(code);
			if (code !== 0) {
				console.log(string);
			}
			resolve(code);
		});
		child.on('error', (err) => {
			console.log(err);
			reject(err);
		});
	});
};

let assembleUsers = (inputDirectory) => {
	fs.readdir(inputDirectory, async(err, files) => {
		files.forEach((file) => {
			let ext = path.extname(file);
			if (ext === '.raw_pcm') {
				let filename = path.basename(file, ext);
				let userId = extractUserId(filename);
				let timestamp = extractTimestamp(filename);
				users[userId] = users[userId] || {
						id: userId,
						fragments: []
					};
				users[userId].fragments.push({
					name: file,
					timestamp: timestamp,
					offset: timestamp - podcastTimestamp
				});
			}
		});

		process.chdir(inputDirectory);

		for (let userId in users) {
			if (users.hasOwnProperty(userId)) {
				let user = users[userId];
				user.fragmentCount = user.fragments.length;
				// Make sure we've got the fragments in chronological order
				user.fragments.sort((a, b) => {
					return a.offset - b.offset;
				});
				// Set the delay for the first fragment
				user.fragments[0].delay = user.fragments[0].offset;

				// Track the fractions of samples that cannot immediately be added
				let leftOvers = 0;
				// Calculate the total sample count for each fragment in preparation for padding them with silence until they meet that total
				// For samples that have both a pad and a delay applied the delay must come second because the following doesn't account for it
				for (let fragmentIndex = 0; fragmentIndex < user.fragments.length - 1; fragmentIndex++) {
					let fragment = user.fragments[fragmentIndex];
					let nextFragment = user.fragments[fragmentIndex + 1];
					let { samples, remainder } = convertDurationToSamples(nextFragment.offset - fragment.offset);
					// Top up the leftover samples with the remainder
					leftOvers += remainder;
					// See if we've enough for a full sample yet
					let usableLeftOvers = Math.floor(leftOvers);
					// Adjust leftovers and current sample count accordingly to try and ensure we don't lose any time
					leftOvers -= usableLeftOvers;
					samples += usableLeftOvers;
					fragment.totalSampleLength = samples;
				}

				await reassemble(user).catch(console.error);
			}
		}
	});
};

// Define global users object
let users = {};
let temporaryFiles = {};
let inputDirectory = "/home/parkermc/RRbot/recordings";
                let podcastName = inputDirectory.split(path.sep);
                podcastName = podcastName[podcastName.length - 1];
                let podcastTimestamp = extractTimestamp(podcastName);


module.exports = { convert: function(){
		wait = true;
		convertAllOpusStringToRawPCM(inputDirectory);
console.log(wait);
//		while (wait){}
		console.log(wait);
		// And then do the rest


		setTimeout(assembleUsers, 25, inputDirectory);
		countDone(inputDirectory);

		var output = fs.createWriteStream(inputDirectory+"/"+Date.now()+'.zip');
		var archive = archiver('zip');

		output.on('close', function () {
		    console.log(archive.pointer() + ' total bytes');
		    console.log('archiver has been finalized and the output file descriptor has closed.');
		});

		archive.on('error', function(err){
		    throw err;
		});

		archive.pipe(output);
		archive.glob(inputDirectory+'/*.mp3');
		archive.finalize();
		console.log("done");
		fs.readdir(inputDirectory, (err, files) => {
			files.forEach((file) => {
				let ext = path.extname(file);
				if (ext !== '.zip') {
					console.log(ext);
				//	fs.unlinkSync(path.join(inputDirectory, file));
				}
			});
		});
	}
}
process.on('unhandledRejection', r => console.log(r));
module.exports.convert();
