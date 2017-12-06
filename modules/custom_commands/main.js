var file = require('./../utils/file.js');
var commands = file.loadJson("customCommands.json");

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
};

function addCommand(bot, argString, message) {
  if (argString.toLowerCase()=="help") {
    message.channel.send("Command exzample: `{\"description\":\"A test command.\",\"command\":\"test\",\"output\":\"{{username}} wants to test for {{arg}}.\",\"argname\":\"random thing\",\"dm\":true,\"channel\":true,\"rank\":\"hydra heads\"}` Note: only command and output are required.");
    return;
  }
  var command = {
    description: "A custom command.",
    argModes: ["none"],
    args: [],
    dm: true,
    channel: true,
    rank: "@everyone",
    otherReqs: []
  };
  var json = {};
  try {
    json = JSON.parse(argString);
  } catch (e) {
    message.channel.send(e.toString().substring(6));
    return;
  }
  if(json.command===undefined||json.output===undefined,typeof json.output !== 'string'||typeof json.command !== 'string'){
    message.channel.send("Error: No command missing command or output. `?addCommand help` for command format.");
    return;
  }
  command.output = json.output;
  command.command = json.command;
  var alreadyCommand = false;
  bot.modules.forEach(function(i) { // Loop though each of the modules and commands
    i.commands.forEach(function(j) {
      if (j.command.toLowerCase() == command.command.toLowerCase()){
        alreadyCommand = true;
      }
    })
  });
  if(alreadyCommand){
    message.channel.send("`"+json.command+"` is already a command.");
    return;
  }
  if(json.description!==undefined&&typeof json.description === 'string'){
    command.description = json.description;
  }
  if(command.output.indexOf("{{arg}}") > -1){
    command.argModes = ["after"];
    if(json.argname!==undefined&&json.argname === 'string'){
      command.args = [json.argname];
    }else{
      command.args = ["arg"];
    }
  }
  if(json.dm==false||json.dm==true){
    command.dm = json.dm;
  }
  if(json.channel==false||json.channel==true){
    command.channel = json.channel;
  }
  if(json.rank!==undefined&&typeof json.rank === 'string'){
    command.rank = json.rank;
  }
  commands[command.command.toLowerCase()] = command;
  file.saveJson("customCommands.json", commands);
  command.function = parseCommand;
  module.exports.commands.push(command);
  message.channel.send("Added.");
}

function parseCommand(bot, argString, message) {
  var command = commands[message.content.toLowerCase().match(/\?(.)*\b/g)[0].split(" ")[0].substring(1)];
  message.channel.send(command.output.replaceAll("{{username}}",message.author.username).replaceAll("{{arg}}",argString));
}

module.exports = {
  name: "Custom Commands",
  description: "An easy way to add all those commands everyone loves.",
  commands:[
    {
      description: "Add a custom command.",
      command: "addCommand",
      argModes: ["after"],
      args: ["json"],
      dm: false,
      channel: true,
      rank: "hydra heads",
      otherReqs: [],
      function: addCommand
    }
  ]
}
for (var commandName in commands) {
  var command = commands[commandName];
  command.function = parseCommand;
  module.exports.commands.push(command);
}
