var file = require('./../utils/file.js');
var utils = require('./../utils/utils.js');

var filename = "quotes";
var quotes = []; // Array to store quotes
quotes = file.loadArray(filename); // Load the quotes
if (quotes.length == 0) quotes = []; // If blank reset array fixed a stange bug

function addquote(argString, message){
  // Adds a quote.
  quotes.push(argString); // Add to array
  message.channel.send("Quote #" + (quotes.indexOf(argString) + 1) + " added.") // Find index and return it
  file.saveArray(filename, quotes); // Save array to file
}

function quote(argString, message){
  // Return a quote
  if(argString == ""){ // If there is no argument send a random quote
    message.channel.send(quotes[uitls.randomInt(0, quotes.length)]);
  }else{
    if (!isNaN(argString)){ // If arg is not int return error
      message.channel.send("\"" + argString + "\" is not a number.");
    }else{
      if (quotes[parseInt(argString)-1] === undefined) { // If quote does not exist return error
        message.channel.send("Quote does not exist.");
      }else{
        message.channel.send(quotes[parseInt(argString)-1]); // Return with quote
      }
    }
  }
}

function quotes(argString, message){
  // TODO: Optimize
  for (var i = 0; i < quotes.length; i++) { // Loop through array and send all the quotes with their index
    message.author.dmChannel.send((i+1) + ": " + quotes[i]);
  }
  message.author.dmChannel.send("Done."); // Say done so that they know that is all
}


module.exports = {
  name: "Quotes",
  description: "A simple quote manager.",
  commands:{
    addquote:{
      description: "Adds a quote.",
      command: "addquote",
      argModes: ["after"],
      args: ["quote"],
      dm: true,
      rank: "Spawn",
      otherReqs: [],
      function: addquote
    },
    quote:{
      description: "Get a random quote or specify a quote number.",
      command: "quote",
      argModes: ["after", "none"],
      args: ["quote number"],
      dm: true,
      rank: "@everyone",
      otherReqs: [],
      function: quote
    },
    quotes:{
      description: "DM's you all of the quotes. (May take a min)",
      command: "quotes",
      argModes: ["none"],
      args: [],
      dm: true,
      rank: "@everyone",
      otherReqs: [],
      function: quotes
    }
  }
}
