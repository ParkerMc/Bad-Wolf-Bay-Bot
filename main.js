var file = require('./file.js');
var settings = require('./settings.js');
const Discord = require('discord.js');

const bot = new Discord.Client();
var version = "v1.0"
var note = "";
var userList = [];
var RR = [];
var userRR = "";
var botChannel = null;
var started = false;
var quotes = [];
var accepted = false;
var currentUser = null;
var alreadyTimedout = [];
var timeToResond = 5;
var timeToResondText = "5 mins" ;
var ifThereMsg = "It is your turn for the RR please run \"?accept\" to accept, \"?deny\" to be moved to the end of the list, or \"?remove\" to be skiped and removed from the list. You will be skiped after " + timeToResondText + ".";
var endMessage = "Send me your when you are done used \"?done\" to add your writeing or you can use \"?deny\" or \"?remove\"."


function next() {
  if (userList.length > 1){
    botChannel.send(userList[0][0].username + " is done passing to " + userList[1][0].username + ".");
    userList.splice(0, 1);
    userList[0][0].dmChannel.send(ifThereMsg);
    userRR = "";
    currentUser = userList[0][0];
    accepted = false;
    timeout(currentUser);
  }else{
    userList.pop();
    file.save2Array("userList", userList);
    botChannel.send("RR done sending to Riza.");
    var userDM = botChannel.members.find(i => i.user.username.toLowerCase() == settings.sendTo.toLowerCase()).user.dmChannel;
    for (var i = 0; i < RR.length; i++) {
      userDM.send(RR[i]);
    }
    started = false;
  }
}
function timeout(user){
  setTimeout(function(user) {
    if(user.username == currentUser.username&&accepted == false){
      user.dmChannel.send("You took too long if this is the first you missed it you will be moved to the end.");
      botChannel.send(user.username + "took too long passing on.")
      if (alreadyTimedout.indexOf(user.username) > -1){
        alreadyTimedout.push(user.username);
        move(userList, 0, userList.length - 1);
      }else{
        userList.splice(0, 1);
      }
      updateList();
      next();
    }
  }, timeToResond*60000, user);
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function isAdmin(message){
  var allRoles = message.channel.guild.roles;
  var roles = [];
  allRoles.forEach(function(i){if (settings.adminRoles.indexOf(i.name) > -1) roles.push(i);});
  for (var i = 0; i < roles.length; i++) {
    if(roles[i].members.get(message.author.id) !== undefined) return true;
  }
  if(settings.adminUsers.indexOf(message.author.username.toLowerCase()) > -1) return true;
  return false;
}

function isPreAdmin(message){
  var allRoles = message.channel.guild.roles;
  var roles = [];
  allRoles.forEach(function(i){if (settings.preAdminRoles.indexOf(i.name) > -1) roles.push(i);});
  for (var i = 0; i < roles.length; i++) {
    if(roles[i].members.get(message.author.id) !== undefined) return true;
  }
  if(settings.adminUsers.indexOf(message.author.username.toLowerCase()) > -1) return true;
  return false;
}

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

function userInList(user) {
  for (var i = 0; i < userList.length; i++) {
    if (userList[i][0].id == user.id) {
      return true;
    }
  }
  return false;
}

function updateList(){
  var msg = "Updated user list: "
  userList.forEach(function(i) {
    if (userList[0][0].id == i[0].id){
      msg += i[0].username;
    }else if (userList[userList.length-1][0].id == i[0].id){
      msg += ", and " + i[0].username;
    }else{
      msg += ", " + i[0].username;
    }
  });
  if (userList.length == 0) msg = "Updated list is now empty";
  botChannel.send(msg + ".");
  file.save2Array("userList", userList);

}
bot.on('ready', () => {
  console.log('Connected!');
  //bot.user.setGame("Testing");
  bot.user.setGame(version + " By: @ParkerMc");
  botChannel = bot.channels.find(i => i.id === settings.botChannel);
  userList = file.load2Array("userList");
  if (userList.length==0) userList=[];
  for (var i = 0; i < userList.length; i++) {
    userList[i][0] = botChannel.members.get(userList[i][0].replace("<@", "").replace(">","")).user;
  }
});

bot.on('message', message => {
  if (currentUser == message.author && message.channel.type == "dm"){
    if (message.content.toLowerCase().match(/^\?accept/)){
      accepted = true;
      botChannel.send(message.author.username + " accepted.");
      for (var i = 0; i < RR.length; i++) {
        message.channel.send(RR[i]);
      }
      message.channel.send(endMessage);
    }else if (message.content.toLowerCase().match(/^\?remove/)){
      userList.splice(0, 1);
      botChannel.send(message.author.username + " denied sending to "+ userList[0][0].username +".");
      message.author.dmChannel.send("You have denied.");
      updateList();
      userList[0][0].dmChannel.send(ifThereMsg);
      userRR = "";
      currentUser = userList[0][0];
      accepted = false;
      timeout(currentUser);
    }else if (message.content.toLowerCase().match(/^\?deny/)){
      move(userList, 0, userList.length - 1);
      botChannel.send(message.author.username + " denied sending to "+ userList[0][0].username +".");
      message.author.dmChannel.send("You have been removed from the list.");
      updateList();
      userList[0][0].dmChannel.send(ifThereMsg);
      userRR = "";
      currentUser = userList[0][0];
      accepted = false;
      timeout(currentUser);
    }else if (message.content.toLowerCase().match(/^\?done/)&&accepted == true){
      message.author.dmChannel.send("Added thank you.");
      if(message.content.substring(6) != ""){
        userRR += "\n" + message.content.substring(6);
      }
      RR.push(userRR);
      next();
    }else if (message.content.toLowerCase().match(/\?done$/)&&accepted == true){
      message.author.dmChannel.send("Added thank you.");
      RR.push(userRR+"\n"+message.content.substring(0, message.content.length - 5));
      userRR = "";
      next();
    }else if (!message.content.toLowerCase().match(/^\?/)&&accepted == true) {
      userRR += "\n" + message.content;
    }
    }else {

    if (message.content.toLowerCase().match(/^\?help/)) {
      if (message.content.toLowerCase().match(/^\?help$/)){
        message.channel.send(settings.help.main);
      }else{
        if ( settings.help[message.content.toLowerCase().replace("?help ", "")] !== undefined ) {
          message.channel.send(settings.help[message.content.toLowerCase().replace("?help ", "")]);
        }else{
          message.channel.send("Command " + message.content.toLowerCase().replace("?help ", "") + " does not exist.");
        }
      }
    }else if(message.content.toLowerCase().match(/^\?add /)){
      if (message.content.substring(5).split(" ").length < 2){
        message.channel.send("Not enough arguments command format is `?add <timezone> <time restrictions>`.");
      }else{
        if (started){
          message.channel.send("The RR has already started only admins can add people.");
        }else{
          if (userInList(message.author)){
            message.channel.send("You are already in the list.");
          }else{
            userList.push([message.author, message.content.substring(5)]);
            updateList();
            message.channel.send("Added.");
          }
        }
      }
    }else if(message.content.toLowerCase().match(/^\?remove$/)){
      if (!userInList(message.author)){
        message.channel.send("You are not in the list.");
      }else{
        for (var i = 0; i < userList.length; i++) {
          if (userList[i][0].id == message.author.id){
            userList.splice(i, 1);
            updateList();
            message.channel.send("Removed.");
            return;
          }
        }
      }
    }else if(message.content.toLowerCase().match(/^\?adda /)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        if (message.content.substring(6).split(" ").length < 3){
          message.channel.send("Not enough arguments command format is `?addA <username> <timezone> <time restrictions>`.")
        }else{
          var username = message.content.substring(6).split(" ")[0];
          var user = message.channel.members.find(i => i.user.username.toLowerCase() == username.toLowerCase());
          var i = 0;
          while (user === null) {
            i++;
            if (message.content.substring(6).split(" ").length < i){
              console.log(i);
              message.channel.send("User not found");
              return;
            }
            username += " " + message.content.substring(6).split(" ")[i];
            user = message.channel.members.find(i => i.user.username.toLowerCase() == username.toLowerCase());
          }
          if (message.content.substring(6).replace(username+" ", "").split(" ").length < 2){
            message.channel.send("Not enough arguments command format is `?addA <username> <timezone> <time restrictions>`.")
          }else{
            user = user.user;
            userList.push([user, message.content.substring(6).replace(username+" ", "")]);
            updateList();
            message.channel.send("Added.");
         }
        }
      }
    }else if(message.content.toLowerCase().match(/^\?move /)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        var arr = message.content.toLowerCase().replace("?move ", "").split(" ");
        if (arr.length < 2){
          message.channel.send("Not enough arguments command format is `?move <username> <index #>`.")
        }else{
          if (!isNaN(arr[arr.length-1])){
            message.channel.send("Error: `" + arr[arr.length-1] + "` is not a number.")
          }else{
            if (parseInt(arr[arr.length-1]) > userList.length){
              message.channel.send("Error: number out of range.");
            }else{
              arr.pop();
              var username = arr.join(" ");
              var arr = message.content.toLowerCase().replace("?move ", "").split(" ");
              for (var i = 0; i < userList.length; i++) {
                if (userList[i][0].username.toLowerCase() == username){
                  move(userList, i, parseInt(arr[arr.length-1])-1);
                  updateList();
                  message.channel.send("Moved.");
                  return
                }
              }
              message.channel.send("User not found.");
            }
          }
        }
      }
    }else if(message.content.toLowerCase().match(/^\?removea /)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        var username = message.content.toLowerCase().replace("?removea ", "");
        if (username == ""){
          message.channel.send("Not enough arguments command format is `?removeA <username>`.")
        }else{
          for (var i = 0; i < userList.length; i++) {
            if (userList[i][0].username.toLowerCase() == username){
              userList.splice(i, 1);
              updateList();
              message.channel.send("Removed.");
              return
            }
          }
          message.channel.send("User not found.");
        }
      }
    }else if(message.content.toLowerCase().match(/^\?list$/)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        var msg = "User list: "
        userList.forEach(function(i) {
          if (userList[0][0].id == i[0].id){
            msg += i[0].username;
          }else if (userList[userList.length-1][0].id == i[0].id){
            msg += ", and " + i[0].username;
          }else{
            msg += ", " + i[0].username;
          }
        });
        if (userList.length == 0) msg = "List is empty";
        message.channel.send(msg + ".");
      }
    }else if(message.content.toLowerCase().match(/^\?note$/)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        message.channel.send(note);
      }
    }else if(message.content.toLowerCase().match(/^\?setnote /)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        if (message.content.substring(9).replace(" ", "") == ""){
          message.channel.send("Not enough arguments command format is `?setNote <note>`.");
        }else{
          note = message.content.substring(9);
          file.save("note", note)
          message.channel.send("Note set.");
        }
      }
    }else if(message.content.toLowerCase().match(/^\?timezones$/)){
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        var msg = "User list: "
        userList.forEach(function(i) {
          if (userList[0][0].id == i[0].id){
            msg += "\n" + i[0].username + " - " + i[1];
          }else if (userList[userList.length-1][0].id == i[0].id){
            msg += ", and \n" + i[0].username + " - " + i[1];
          }else{
            msg += ",\n" + i[0].username + " - " + i[1];
          }
        });
        if (userList.length == 0) msg = "List is empty";
        message.channel.send(msg + ".");
      }
    }else if(message.content.toLowerCase().match(/^\?addquote /)){
      if(!isPreAdmin(message)){
        message.channel.send("You are not authorized to run this command.")
      }else{
        if(message.content.substring(10) == ""){
          message.channel.send("Not enough arguments command format is `?addquote <quote>`.");
        }else{
          quotes.push(message.content.substring(10));
          message.channel.send("Quote #" + (quotes.indexOf(message.content.substring(10)) + 1) + " added.")
          file.saveArray("quotes", quotes);
        }
      }
    }else if(message.content.toLowerCase().match(/^\?quotes$/)){
      for (var i = 0; i < quotes.length; i++) {
        message.author.dmChannel.send((i+1) + ": " + quotes[i]);
      }
      message.author.dmChannel.send("Done.");
    }else if(message.content.toLowerCase().match(/^\?quote/)){
      if(message.content.substring(7) == ""){
        message.channel.send(quotes[randomInt(0, quotes.length)]);
      }else{
        if (quotes[parseInt(message.content.substring(7))-1] === undefined) {
          message.channel.send("Quote does not exist.");
        }else{
          message.channel.send(quotes[parseInt(message.content.substring(7))-1]);
        }
      }
    }else if (message.content.match(/^\?start$/)) {
      if(!isAdmin(message)){
        message.channel.send("You are not authorized to run this command.");
      }else{
        botChannel.send(message.author.username+" has started the RR " + userList[0][0].username + " will start.");
        userList[0][0].dmChannel.send(ifThereMsg);
        currentUser = userList[0][0];
        userRR = "";
        RR = [];
        accepted = false;
        timeout(currentUser);
      }
    }else if(message.content.match(/^\?/)){
      message.channel.send("Command " + message.content.split(" ")[0] + " does not exist.");
    }
  }
});

// Load files
note = file.load("note");
started = file.loadBool("started");
RR = file.loadArray("RR");
quotes = file.loadArray("quotes");
if (RR.length == 0) RR = [];
if (quotes.length == 0) quotes = [];
if (note.replace(" ", "") == "") note = "Please write 3 sentences in 15 minutes that build on things people have written before you.";
bot.login("token");
