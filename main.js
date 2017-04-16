const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const settings = require('./settings.js');

process.on('unhandledRejection', r => console.log(r)); // Helps with errors
const bot = new Discord.Client(); // Set bot object
var version = "V1.2" // Version
var modules = []; // Array to hold all of the modules

fs.readdirSync("./modules") // Get all folders in modules and loop though them
  .filter(file => fs.statSync(path.join("./modules", file)).isDirectory()).forEach(function(i){
    fs.readdir(path.join("./modules", i), (err, files) => { // Get files
      files.forEach(file => { // And loop though those
        if (file == "main.js"){ // If file name is main.js add it to the modules array
          modules.push(require("./" + path.join("./modules", path.join(i, file))));
        }
      });
    })
  });

  function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }

function reg(regexa, input, regexb) {
  var flags;
  //could be any combination of 'g', 'i', and 'm'
  flags = 'gi';
  input = regexEscape(input);
  return new RegExp(regexa + input + regexb, flags);
}

function atAboveRole(message, role) { // Get if user is at or about the role provied
  var roles = []; // Stores all of the roles that are at above
  var index = settings.roles.indexOf(role.toLowerCase()); // Index of the lowest role
  for (var i = index; i < settings.roles.length; i++) {
    roles.push(settings.roles[i]); // Add roles that are higher than the lowest allowed
  }
  return inRole(message, roles); // Check if in one of roles
}

function inRole(message, inRoles){
  var roles = []; // Store the roles objects
  message.channel.guild.roles.forEach( // For each of roles in the server add it if the name is in array
    function(i){if (inRoles.indexOf(i.name.toLowerCase()) > -1) roles.push(i);});
  for (var i = 0; i < roles.length; i++) { // Loop  though roles and see if member is part any of them
    if(roles[i].members.get(message.author.id) !== undefined) return true;
  }
  return false; // Else false
}

bot.on('ready', function(){
  bot.user.setGame(version + " By: @ParkerMc"); // Set game #sellOut
  modules.forEach(function(i) { // Loop thought modules
    if(i["onReady"] !== undefined){ // If onReady if defined run it
      i.onReady(bot);
    }
  });
  console.log('Connected!');
});

bot.on('message', message => {
  if (message.content.toLowerCase().match(/^\?help$/)){ // If message is ?help
    var msg = "```\n" + settings.description + "\n"; // Add start stuf
    modules.forEach(function(i) {
      msg += "\n" + i.name + ":"; // Added category
      i.commands.forEach(function(j) { // For each command in that module
        if(atAboveRole(message, j.rank)){ // Check if user can run command
          msg += "\n  " + j.command; // Add command and description
          msg += "          ".substring(j.command.length) + j.description;
        }
      });
    });
    msg += "\nHelp:"; // Add help module info
    msg += "\n  help      Shows this message.";
    msg += "\n\nType ?help command for more info on a command.";
    msg += "\nYou can also type ?help category for more info on a category.```";
    message.channel.send(msg); // Send message
  }else if (message.content.toLowerCase().match(/^\?help /)) { // If it is help with arg
    // TODO: Move to it's own module
    var found = false; // If command is found
    modules.forEach(function(i) { // Loop though each of the modules and commands
      i.commands.forEach(function(j) {
        if (j.command.toLowerCase() == message.content.substring(6).toLowerCase()){
          // TODO: add if channel and stuff like that
          //If the command matches the arg
          var msg = "```" + j.description; // Start message and add description
          for (var k = 0; k < j.argModes.length; k++) { // Loop though all of the possable arg modes
            if (j.argModes[k] != j.argModes[0]){ // If it is not the first add newline or
              msg += "\nor"
            }
            if (j.argModes[k] == "none") { // If the mode is none just add command
              msg += "\n?" + j.command;
            }else if (j.argModes[k] == "after") { // If the mode is after add the command
              msg += "\n?" + j.command;
              j.args.forEach(arg => msg += " <" + arg + ">"); // Then all of the args
            }else if (j.argModes[k] == "before") { // If the mode is before add all the args
              msg += "\n";
              j.args.forEach(arg => msg += "<" + arg + "> ");
              msg += "?" + j.command; // Then the command
            }
          }
          msg += "```"; // Add end code brakets
          message.channel.send(msg); // Send message
          found = true;
        }
      });
    });
    // TODO: Add catagorys info
    if(!found){ // If not found say that
      message.channel.send("No information found on that.");
    }
  }else if (message.content.toLowerCase().match(/\s\?/)||message.content.toLowerCase().match(/^\?/)){ // If it is a command
    // Get the command with regex and remove extra space (if it is there)
    var command = message.content.toLowerCase().match(/\?(.)*\b/g)[0].split(" ")[0];
    modules.forEach(function(i) { // Loop though each of the modules and commands
      i.commands.forEach(function(j) {
        if ("?"+j.command.toLowerCase() == command){ // If it is the command we are looking for
          // TODO: Comment
          if(atAboveRole(message, j.rank)&&((message.channel.type == "dm"&&j.dm)||(message.channel.type == "text"&&j.channel))){
            if(j.argModes.indexOf("none") > -1&&message.content.toLowerCase().match(reg("^",command, "$"))){
              var continueCommand = true;
              j.otherReqs.forEach(function(k){
                if (!k("", message)){
                  continueCommand = false;
                }
              });
              if(continueCommand){
                j.function("", message);
              }
            }else if(j.argModes.indexOf("after") > -1&&message.content.toLowerCase().match(reg("^",command, "\\s"))){
              var args = message.content.substring(command.length+1).split(" ");
              if (args.length >= j.args.length){
                args = args.join(" ");
                var continueCommand = true;
                j.otherReqs.forEach(function(k){
                  if (!k(args, message)){
                    continueCommand = false;
                  }
                });
                if(continueCommand){
                  j.function(args, message);
                }
              }else {
                var msg = "Not enough arguments command format is `?" + j.command;
                j.args.forEach(arg => msg += " <" + arg + ">"); // Then all of the args
                msg += "`";
                message.channel.send(msg);
              }
            }
            // TODO: add before
          }
        }
      });
    });

  }
});
bot.login("token"); // Start the bot
