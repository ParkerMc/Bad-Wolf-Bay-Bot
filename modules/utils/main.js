function f(argString, message){
 message.channel.send(message.author.username + " pays their respects.");
}

function fiteme(argString, message){
 message.channel.send(message.author.username + "challenges " + argString + " to a fite!");
}

module.exports = {
  name: "Random stuff",
  description: "This is were all the random stuff goes.",
  commands:[
    {
      description: "Pay your respects.",
      command: "f",
      argModes: ["none"],
      args: [],
      dm: false,
      channel: true,
      rank: "@everyone",
      otherReqs: [],
      function: f
    },
    {
      description: "Fite someone.",
      command: "fiteme",
      argModes: ["after"],
      args: ["username"],
      dm: false,
      channel: true,
      rank: "@everyone",
      otherReqs: [],
      function: fiteme
    }
  ]
}
