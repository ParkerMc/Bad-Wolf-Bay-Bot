var film = require("./film.js").film;

var LINES_PER_FRAME = 14;
var DELAY_NORMAL = 67;
var DELAY_NORMAL = 603;
var g_frameStep = 1; //advance one frame per tick
var g_updateDelay = DELAY_NORMAL;
var g_timerHandle = null;
var g_currentFrame = 0;

function validateFrame(frameNumber)
{
	return ( frameNumber > 0 && frameNumber < Math.floor( film.length / LINES_PER_FRAME ) )
}

async function displayFrame(frameNumber, message)
{
	if( validateFrame(frameNumber) != true )
		return;
  	var buffer = "";
    for (var line = 1; line < 14; line++)
    {
    	var lineText = film[ (g_currentFrame * LINES_PER_FRAME) + line];
    	if( !lineText || lineText.length < 1 )
    		lineText = ' ';

    	buffer += lineText+"\n";

    }
    await message.edit("```\n" + buffer + "```");
}

function updateDisplay(message)
{
  if(g_currentFrame==3410){
    return;
  }
	if(g_timerHandle)
		clearTimeout(g_timerHandle);

    displayFrame(g_currentFrame, message);

    if( g_frameStep != 0 )
    {
    	//read the first line of the current frame as it is a number containing how many times this frame should be displayed
    	var nextFrameDelay = film[ g_currentFrame * LINES_PER_FRAME ] * g_updateDelay;

    	var nextFrame = g_currentFrame + (g_frameStep);

    	if(validateFrame(nextFrame) == true)
			g_currentFrame = nextFrame;

        g_timerHandle = setTimeout( updateDisplay, nextFrameDelay, message);
    }
}

async function Play(bot, argString, message)
{
  if(message.channel.name == "bottalk"){
      g_frameStep = 9;
      g_updateDelay = DELAY_NORMAL;
      messageS = await message.channel.send("```starting```");
  	updateDisplay(messageS);
  }else{
    message.channel.send("Wrong channel.");
  }
}


module.exports = {
  name: "Star Wars",
  description: "In a galaxy far far away - Star Wars!",
  commands:[
    {
      description: "Try and you shall see.",
      command: "starWars",
      argModes: ["none"],
      args: [],
      dm: true,
      channel: true,
      rank: "hydra heads",
      otherReqs: [],
      function: Play
    }
  ]
}
