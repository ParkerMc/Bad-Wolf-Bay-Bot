// TODO: Comment
var file = require('./../utils/file.js');
var utils = require('./../utils/utils.js');
var settings = require('./../../settings.js');

var firstConnect = true; // Used to make sure some things that need to be connected only get ran once
var botChannelId = "303706109238050819" // Teting channel
//var botChannelId = "299032114677022722"; // Channel for the Bot to put updates in
var botChannel = null;
var RR = file.loadJson("RR.json"); // load json file
// Set a few messages
var timeToResond = 5;
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

if (RR["started"] === undefined){
  RR["started"] = false;
}

if (RR["paused"] === undefined){
  RR["paused"] = false;
}

if (RR["currentUser"] === undefined){
  RR["currentUser"] = null;
}

if (RR["index"] === undefined){
  RR["index"] = 0;
}

// TODO: move to utils
function atAboveRole(message, role) { // Get if user is at or about the role provied
  var roles = []; // Stores all of the roles that are at above
  var index = settings.roles.indexOf(role.toLowerCase()); // Index of the lowest role
  for (var i = index; i < settings.roles.length; i++) {
    roles.push(settings.roles[i]); // Add roles that are higher than the lowest allowed
  }
  return inRole(message, roles); // Check if in one of roles
}
// TODO: move to utils
function inRole(message, inRoles){
  var roles = []; // Store the roles objects
  message.channel.guild.roles.forEach( // For each of roles in the server add it if the name is in array
    function(i){if (inRoles.indexOf(i.name.toLowerCase()) > -1) roles.push(i);});
  for (var i = 0; i < roles.length; i++) { // Loop  though roles and see if member is part any of them
    if(roles[i].members.get(message.author.id) !== undefined) return true;
  }
  return false; // Else false
}

function save() {
  file.saveJson("RR.json", RR);
}
// TODO: move to utils
function move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing purposes
}

function next() {
  if (RR["index"] < RR.length){
    botChannel.send(RR["userList"][RR["index"]]["user"].username + " is done passing to " + userList[RR["index"]+1]["user"].username + ".");
    RR["index"]++;
    RR["userList"][RR["index"]]["user"].send(ifThereMsg);
    RR["currentUser"] = RR["userList"][RR["index"]];
    RR["userList"][RR["index"]]["accepted"] = false;
    RR["userList"][RR["index"]]["text"] = [];
    save();
    timeout(RR["userList"][RR["index"]]);
  }else{
    save();
    botChannel.send("RR done sending to Riza.");
    var userDM = botChannel.members.find(i => i.user.username.toLowerCase() == settings.sendTo.toLowerCase()).user;
    for (var i = 0; i < RR.length; i++) {
      userDM.send(RR[i]);
    }
    started = false;
  }
}

function timeout(user){
  setTimeout(function(user) {
    if(user["user"].username == RR["currentUser"]["user"].username&&RR["currentUser"]["accepted"] == false&&!RR["paused"]){
      user.send("You took too long if this is the first you missed it you will be moved to the end.");
      botChannel.send(user.username + "took too long passing on.")
      if (!user["alreadyTimedout"]){
        user["alreadyTimedout"] == true;
        move(RR["userList"], 0, RR["userList"].length - 1);
      }else{
        RR["userList"].splice(0, 1);
      }
      listUsers(botChannel, "Updated user list: ");
      next();
    }
  }, timeToResond*60000, user);
}

async function onReady(bot){
  if (firstConnect){ // Make sure this is the first connet
    botChannel = bot.channels.find(i => i.id === botChannelId); // Get the bot channel
    for (var i = 0; i < RR["userList"].length; i++) { // Changed all the user ids that are saved into user objects
      RR["userList"][i]["user"] = await bot.fetchUser(RR["userList"][i]["user"].id);
    }
    if (RR["currentUser"] !== null) {
      RR["currentUser"] = await bot.fetchUser(RR["currentUser"].id);
      timeout(RR["userList"][RR["userList"].indexOf(RR["currentUser"])]);
    }
  }
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

function listUsers(channel, msg){
  RR["userList"].forEach(function(i) { // Go through and add each username to message
    if (RR["userList"].indexOf(i) == 0){ // If it is the first just add the username
      msg += i["user"].username;
    }else if (RR["userList"].indexOf(i) == RR["userList"].length - 1){ // else if it is the last add ", and " then username
      msg += ", and " + i["user"].username;
    }else{ // Else it is one in the middle so just add comma and username
      msg += ", " + i["user"].username;
    }
  });
  if (RR["userList"].length == 0){ // If list is empty say that.
    msg += "empty";
  }
  channel.send(msg + "."); // Send message and add period
}

function userInList(user) {
  for (var i = 0; i < RR["userList"].length; i++) {
    if (RR["userList"][i]["user"].id == user.id) {
      return true;
    }
  }
  return false;
}

function add(argString, message){ // Add the user to list
  RR["userList"].push({user: message.author, restrictions: argString});
  listUsers(botChannel, "Updated user list: ");
  save();
  message.channel.send("Added.");
}

function addA(argString, message) {
  var username = argString.split(" ")[0];
  var user = message.channel.members.find(i => i.user.username.toLowerCase() == username.toLowerCase());
  var i = 0;
  while (user === null) {
    i++;
    if (argString.split(" ").length < i){
      message.channel.send("User not found.");
      return;
    }
    username += " " + username.split(" ")[i];
    user = message.channel.members.find(i => i.user.username.toLowerCase() == username.toLowerCase());
  }
  RR["userList"].push({user: user.user, restrictions: argString.substring(username.length+1)});
  listUsers(botChannel, "Updated user list: ");
  save();
  message.channel.send("Added.");
}

function accept(argString, message) {

}

function list(argString, message) {
  listUsers(message.channel, "User list: ");
}

function remove(argString, message) {
  if(argString == ""){
    RR["userList"].forEach(function(i){
      if (i["user"].id == message.author.id){
        RR["userList"].splice(RR["userList"].indexOf(i), 1);
      }
    });

    message.channel.send("Removed.");
    save();
  }else {
    for (var i = 0; i < RR["userList"].length; i++) {
      if (RR["userList"][i]["user"].username.toLowerCase() == argString.toLowerCase()){
        RR["userList"].splice(i, 1);
        listUsers(botChannel, "Updated user list: ");
        message.channel.send("Removed.");
        save();
        return;
      }
    }
    message.channel.send("User not found.");
  }
}

function start(argString, message) {
  if(!RR["started"]){
    RR["started"] = true;
    if (RR["currentUser"] === null) {
        botChannel.send(message.author.username+" has started the RR " + RR["userList"][0]["user"].username + " will start.");
        RR["userList"][0]["user"].send(ifThereMsg);
        RR["currentUser"] = RR["userList"][0];
        RR["userList"][0]["accepted"] = false;
        RR["userList"][0]["alreadyTimedout"] = false;
        RR["userList"][0]["text"] = [];
        RR["index"] = 0;
        save();
        message.channel.send("Started.");
        timeout(RR["userList"][0]);
    }
  }
}

function pause(argString, message) {
  if (RR["paused"]){
    message.channel.send("Unpaused. Will now timeout people.");
    RR["paused"] = false;
  }else {
    message.channel.send("Paused. Will not timeout people till someone unpauses.");
    RR["paused"] = true;
  }
 save();
}

module.exports = {
  name: "Round Robbin",
  description: "The Round Robin is where we get a list of names of people who want to join the robin. Depending on the amount of people we usually have each person write 3 sentences in 15 minutes then pass it on to the bot. Rizapheonyxx usually goes through it for grammar errors.",
  onReady: onReady,
  commands:[
    {
      description: "Settings for the RR.",
      command: "RRSettings",
      argModes: ["none", "after"],
      args: ["timezone", "writer name"],
      dm: true,
      channel: true,
      rank: "@everyone",
      otherReqs: [],
      function: rrsettings
    },
    {
      description: "Adds you to the RR list",
      command: "add",
      argModes: ["after", "none"],
      args: ["time restrictions"],
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
    },
    {
      description: "Add someone to the RR list.",
      command: "addA",
      argModes: ["after"],
      args: ["username> <time restrictions(optional)"],
      dm: false,
      channel: true,
      rank: "hydra heads",
      otherReqs: [],
      function: addA
    },
    {
      description: "Shows the users in the list.",
      command: "list",
      argModes: ["none"],
      args: [],
      dm: false,
      channel: true,
      rank: "hydra heads",
      otherReqs: [],
      function: list
    },
    {
      description: "Remove your self or someone else from the list.",
      command: "remove",
      argModes: ["none", "after"],
      args: ["username"],
      dm: true,
      channel: true,
      rank: "@everyone",
      otherReqs: [function(argString, message) {
        if(argString != ""){
          if(atAboveRole(message, "hydra heads")){
            return true;
          }
          // TODO: Add perm error
          return false;
        }else {
          var found = false;
          RR["userList"].forEach(function(i){
            if (i["user"].id == message.author.id){
              found = true;
            }
          });
          return found;
        }
      }],
      function: remove
    },
    {
      description: "Starts the RR.",
      command: "startRR",
      argModes: ["none"],
      args: [],
      dm: false,
      channel: true,
      rank: "hydra heads",
      otherReqs: [],
      function: start
    },
    {
      description: "Stops timeingout people.",
      command: "pauseRR",
      argModes: ["none"],
      args: [],
      dm: false,
      channel: true,
      rank: "hydra heads",
      otherReqs: [],
      function: pause
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
    },*/
  ]
}
