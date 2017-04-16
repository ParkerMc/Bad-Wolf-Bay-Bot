var file = require('./../utils/file.js');
var utils = require('./../utils/utils.js');

var filename = "quotes";
var quotesL = file.loadArray(filename); // Load the quotes

function addquote(argString, message){
  // Adds a quote.
  quotesL.push(argString); // Add to array
  message.channel.send("Quote #" + (quotesL.indexOf(argString) + 1) + " added.") // Find index and return it
  file.saveArray(filename, quotesL); // Save array to file
}

function quote(argString, message){
  // Return a quote
  if(argString == ""){ // If there is no argument send a random quote
    message.channel.send(quotesL[utils.randomInt(0, quotesL.length)]);
  }else{
        message.channel.send(quotesL[parseInt(argString)-1]); // Return with quote
  }
}

function quotes(argString, message){
  msg = "";
  for (var i = 0; i < quotesL.length; i++) { // Loop through array and send all the quotes with their index
    if ((msg + "\n" + (i+1) + ": " + quotesL[i]).length >= 2000){
        message.author.send(msg);
        msg = "";
    }
    msg += "\n" + (i+1) + ": " + quotesL[i];
  }
  message.author.send(msg);
}


module.exports = {
  name: "Quotes",
  description: "A simple quote manager.",
  commands:[
    {
      description: "Adds a quote.",
      command: "addquote",
      argModes: ["after"],
      args: ["quote"],
      dm: false,
      channel: true,
      rank: "Spawn",
      otherReqs: [],
      function: addquote
    },
    {
      description: "Get a random quote or specify a quote number.",
      command: "quote",
      argModes: ["after", "none"],
      args: ["quote number"],
      dm: true,
      channel: true,
      rank: "@everyone",
      otherReqs: [function(argString, message) {
        if(argString != ""){
          if (isNaN(argString)){ // If arg is not int return error
            message.channel.send("`" + argString + "` is not a number.");
            return false;
          }
          if (quotesL[parseInt(argString)-1] === undefined) { // If quote does not exist return error
            message.channel.send("Quote does not exist.");
            return false;
          }
        }
        return true;
      }],
      function: quote
    },
    {
      description: "DM's you all of the quotes.",
      command: "quotes",
      argModes: ["none"],
      args: [],
      dm: true,
      channel: true,
      rank: "@everyone",
      otherReqs: [],
      function: quotes
    }
  ]
}
