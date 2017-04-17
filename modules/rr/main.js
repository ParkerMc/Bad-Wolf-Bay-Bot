var file = require('./../utils/file.js');
var utils = require('./../utils/utils.js');

var firstConnect = true; // Used to make sure some things that need to be connected only get ran once
var botChannelId = "299032114677022722"; // Channel for the Bot to put updates in
var botChannel = null;
var RR = file.loadJson("RR.json"); // load json file
// Set a few messages
var timeToResondText = "5 minutes";
var ifThereMsg = "It is your turn for the RR please run \"?accept\" to accept, \"?deny\" to be moved to the end of the list, or \"?remove\" to be skiped and removed from the list. You will be skiped after " + timeToResondText + ".";
var endMessage = "Send me your when you are done used \"?done\" to add your writeing or you can use \"?deny\" or \"?remove\"."
// Setup Json
if (RR["note"] === undefined || RR["note"] == ""){
  RR["note"] = "Please write 3 sentences in 15 minutes that build on things people have written before you.";
}
if (RR["userList"] === undefined){
  RR["userList"] = [];
}

if (RR["userSettings"] === undefined){
  RR["userSettings"] = new Map();
}

function save() {
  file.saveJson("RR.json", RR);
}

function rrsettings(argString, message) {
  if(argString == ""){
    if(RR["userSettings"][message.author.id] === undefined){
      message.channel.send("You settings have not been set.");
    }else {
      var msg = "```";
      msg += "\nWritername: " + RR["userSettings"][message.author.id]["name"];
      msg += "\nTimezone: " + RR["userSettings"][message.author.id]["timezone"];
      msg += "\n```";
      message.channel.send(msg);
    }
  }else {
    RR["userSettings"][message.author.id] = new Map();
    RR["userSettings"][message.author.id]["timezone"] = argString.split(" ")[0];
    RR["userSettings"][message.author.id]["name"] = argString.substring(argString.split(" ")[0].length+1);
    save();
    message.channel.send("Settings updated.");
  }
}

function updateList(){
  var msg = "Updated user list: " // Start of message
  RR["userList"].forEach(function(i) { // Go through and add each username to message
    if (RR["userList"].indexOf(i) == 0){ // If it is the first just add the username
      msg += i[0].username;
    }else if (RR["userList"].indexOf(i) == RR["userList"].length - 1){ // else if it is the last add ", and " then username
      msg += ", and " + i[0].username;
    }else{ // Else it is one in the middle so just add comma and username
      msg += ", " + i[0].username;
    }
  });
  if (userList.length == 0){ // If list is empty say that.
    msg = "Updated list is empty";
  }
  botChannel.send(msg + "."); // Send message and add period
}

function userInList(user) {
  for (var i = 0; i < RR["userList"].length; i++) {
    if (RR["userList"][i][0].id == user.id) {
      return true;
    }
  }
  return false;
}

async function onReady(bot){
  if (firstConnect){ // Make sure this is the first connet
    botChannel = bot.channels.find(i => i.id === botChannelId); // Get the bot channel
    for (var i = 0; i < RR["userList"].length; i++) { // Changed all the user ids that are saved into user objects
      RR["userList"][i][0] = await bot.fetchUser(RR["userList"][i][0].replace("<@", "").replace(">",""));
    }
  }
}

function add(argString, message){ // Add the user to list
  RR["userList"].push(argString.split(" ")[0], argString.substring(argString.split(" ")[0].length + 1));
  updateList();
  save();
  message.channel.send("Added.");
}

function accept() {

}


module.exports = {
  name: "Round Robbin",
  description: "The Round Robin is where we get a list of names of people who want to join the robin. Depending on the amount of people we usually have each person write 3 sentences in 15 minutes then pass it on to the bot. Rizapheonyxx usually goes through it for grammar errors.",
  onReady: onReady,
  commands:[
    {
      description: "Settings for the RR.",
      command: "rrsettings",
      argModes: ["none", "after"],
      args: ["timezone", "writer name"],
      dm: true,
      channel: true,
      rank: "@everyone",
      otherReqs: [],
      function: rrsettings
    }
    /*
    {
      description: "Accept the RR.",
      command: "accept",
      argModes: ["none"],
      args: [""],
      dm: true,
      channel: false,
      rank: "@everyone",
      otherReqs: [function(argString, message) {
        if(currentUser == message.author&&accepted == false) return true;
        return false;}],
      function: accept
    },
    {
      description: "Adds you to the RR list",
      command: "add",
      argModes: ["after"],
      args: ["timezone", "time restrictions"],
      dm: false,
      channel: true,
      rank: "@everyone",
      otherReqs: [function(argString, message) {
        if(userInList(message.author)){ // Make sure user is not already in the list
          message.channel.send("You are already in the list.");
          return false;
        }
        return true;
      }],
      function: add
    }*/
  ]
}
