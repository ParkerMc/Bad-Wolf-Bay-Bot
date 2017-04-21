var maxDiceTimes  = 10;
var maxDiceSides  = 256;
var maxModifier   = 256;

function rollDice(max) {
    return Math.floor(Math.random() * (max)) + 1;
}

function roll(argString, message){

  var match = message.content.match(/(\d+)?d(\d+)([-+*\/])?(\d+)?d?(\d+)?/);
  if (match === null){
    message.channel.sendMessage('Try using dice notation (1d6)');
    return;
  }

  var times         = ((Number.isSafeInteger(parseInt(match[1], 10))) ? parseInt(match[1], 10) : 1 ); //gotta be safe
  var diceSides     = ((Number.isSafeInteger(parseInt(match[2], 10))) ? parseInt(match[2], 10) : 20); //defaults to 1d20
  var symbol        = ((match[3] !== undefined)                       ?          match[3]      : ''); //defaults to empty
  var times2        = ((Number.isSafeInteger(parseInt(match[4], 10))) ? parseInt(match[4], 10) : ''); //defaults to empty
  var diceSides2    = ((Number.isSafeInteger(parseInt(match[5], 10))) ? parseInt(match[5], 10) : ''); //defaults to empty

  if (times > maxDiceTimes || diceSides > maxDiceSides) {
      message.channel.sendMessage('Max times you can roll is ' + maxDiceTimes + '. Max sides per die is ' + maxDiceSides + '.');
      return;
  }

  if (times <= 0 || diceSides <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die. Try it, I dare you.
      message.channel.sendMessage('You can\'t roll a die 0 or negative time. Try it, I dare you.');
      return;
  }

  var diceString = '';
  var diceTotal = 0;
  var currentRoll = 0;

  for (i = times; i > 0; i--) {
      currentRoll = rollDice(diceSides);
      diceTotal += currentRoll;
      diceString +=  currentRoll + ((i === 1) ? ' ' : ' + ');

  }


  if (symbol !== '' && ((times2 !== '') || (diceSides2 !== ''))) {
      diceString += '= ' + diceTotal + ' ' + symbol + ' ';

      if (times2 !== '' && diceSides2 === '') {
          if (times2 > maxModifier) {
              message.channel.sendMessage('Max modifier is ' + maxModifier + '.');
              return;
          }
          diceTotal = parseEquation(diceTotal, symbol, times2);
          diceString += times2;
      }else {
          if (times2 > maxDiceTimes || diceSides2 > maxDiceSides) {
              message.channel.sendMessage('Max times you can roll is ' + maxDiceTimes + '. Max sides per die is ' + maxDiceSides + '.');
              return;
          }

          if (times2 <= 0 || diceSides2 <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die.
              message.channel.sendMessage('You can\'t roll a die 0 or negative time. Try it, I dare you.');
              return;
          }

          var diceTotal2 = 0;
          times2 = ((times2 !== '') ? times2 : 1);

          for (i = times2; i > 0; i--) {
              diceTotal2 += rollDice(diceSides2);
          }
          diceTotal = parseEquation(diceTotal, symbol, diceTotal2);
          diceString += diceTotal2;
      }
      diceString += '';
  }


  diceString += '\n' + '=> ' + diceTotal;

  message.channel.sendMessage(diceString);

  if (diceSides === 1) {
      message.channel.sendMessage("Seriously? What did you expect?");
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
