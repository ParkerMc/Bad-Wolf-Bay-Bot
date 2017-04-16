
module.exports = {
  randomInt: function (low, high) {
    // Genarate a random int between two numbers
    return Math.floor(Math.random() * (high - low)) + low;
  }
}
