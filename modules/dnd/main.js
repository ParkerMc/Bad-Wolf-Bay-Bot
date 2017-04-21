var maxDiceTimes  = 10;
var maxDiceSides  = 256;
var maxModifier   = 256;

function rollDice(max) {
    return Math.floor(Math.random() * (max)) + 1;
}

function rollDie(match) {
  var output = "";
  var diceString = "";
  var diceTotal = 0;
  if (match === null){
    output += 'Try using dice notation (1d6)';
    return;
  }

  var times = ((Number.isSafeInteger(parseInt(match[1], 10))) ? parseInt(match[1], 10) : 1); //gotta be safe
  var diceSides = ((Number.isSafeInteger(parseInt(match[2], 10))) ? parseInt(match[2], 10) : 6); //defaults to 1d20

  if (times > maxDiceTimes || diceSides > maxDiceSides) {
      output += '\nMax times you can roll is ' + maxDiceTimes + '. Max sides per die is ' + maxDiceSides + '.';
      return;
  }

  if (times <= 0 || diceSides <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die. Try it, I dare you.
      output += '\nYou can\'t roll a die 0 or negative time. Try it, I dare you.';
      return;
  }

  for (i = times; i > 0; i--) {
      currentRoll = rollDice(diceSides);
      diceTotal += currentRoll;
      diceString +=  currentRoll + ((i === 1) ? ' ' : ' + ');

  }
  diceString += ' => ' + diceTotal;

  output += diceString;

  if (diceSides === 1) {
      output += "\nSeriously? What did you expect?";
  }
  return output;
}

function roll(argString, message){
  var argArray = argString.split(" ");
  var msg = "";
  for (var i = 0; i < argArray.length; i++) {
    if(match = argArray[i].match(/(\d+)?d(\d+)/)){
      msg += rollDie(match)  + "\n";
    }else if (!isNaN(argArray[i])) {
      if(match = argArray[i-1].match(/(\d+)?d(\d+)/)){
        for (var j = 1; j < parseInt(argArray[i]); j++) {
          msg += rollDie(match) + "\n";
        }
      }
    }
  }
  if (msg!=""){
    message.channel.send(msg);
  }
}


module.exports = {
  name: "DnD",
  description: "Helps with the DnD games.",
  commands:[
    {
      description: "Rolls dice in dice notation.",
      command: "roll",
      argModes: ["after"],
      args: ["dice"],
      dm: true,
      channel: true,
      rank: "@everyone",
      otherReqs: [],
      function: roll
    }
  ]
}
