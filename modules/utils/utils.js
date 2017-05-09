var settings = require('./../../settings.js');

function atAboveRole(message, role) { // Get if user is at or about the role provied
  var roles = []; // Stores all of the roles that are at above
  var index = settings.roles.indexOf(role.toLowerCase()); // Index of the lowest role
  for (var i = index; i < settings.roles.length; i++) {
    roles.push(settings.roles[i]); // Add roles that are higher than the lowest allowed
  }
  return inRole(message, roles); // Check if in one of roles
}

function inRole(message, inRoles){
  var roles = []; // Store the roles objects
  message.channel.guild.roles.forEach( // For each of roles in the server add it if the name is in array
    function(i){if (inRoles.indexOf(i.name.toLowerCase()) > -1) roles.push(i);});
  for (var i = 0; i < roles.length; i++) { // Loop  though roles and see if member is part any of them
    if(roles[i].members.get(message.author.id) !== undefined) return true;
  }
  return false; // Else false
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

module.exports = {
  randomInt: function (low, high) {
    // Genarate a random int between two numbers
    return Math.floor(Math.random() * (high - low)) + low;
  },
  atAboveRole:atAboveRole,
  inRole:inRole,
  move:move
}
