var fs = require("fs")

function exists(name){
  return fs.existsSync(name);
}

module.exports = {
  load: function(name){
    if (exists(name)){
      return fs.readFileSync(name).toString();
    }
      return "";
  },
  loadJson: function(name){
    if (exists(name)){
      return JSON.parse(fs.readFileSync(name).toString());
    }
      return JSON.parse("{}");
  },
  loadBool: function(name){
    if (exists(name)){
      if (fs.readFileSync(name).toString() == "true") {
        return true;
      }
    }
    return false;
  },

  loadArray: function(name){
    if (exists(name)){
      var arr = fs.readFileSync(name).toString().split("\n");
      arr.splice(-1,1);
      return arr;
    }
    return [];

  },

  load2Array: function(name){
    if (exists(name)){
      var arr = fs.readFileSync(name).toString().split("\n");
      arr.splice(-1,1);
      var out = [];
      arr.forEach(function(i){out.push([i.split(",")[0], i.split(",")[1].trim()])})
      return out;
    }
      return [];
  },

  save: function(name, text){
    var file = fs.createWriteStream(name);
    file.write(text);
    file.end();
  },

  saveJson: function(name, json){
    var file = fs.createWriteStream(name);
    file.write(JSON.stringify(text));
    file.end();
  },

    saveBool: function(name, bool){
      var file = fs.createWriteStream(name);
      if(bool)file.write("true");
      if(!bool)file.write("false");
      file.end();
    },

  saveArray: function(name, arr){
    var file = fs.createWriteStream(name);
    arr.forEach(function(v) { file.write(v + '\n'); });
    file.end();
  },

  save2Array: function(name, arr){
    var file = fs.createWriteStream(name);
    arr.forEach(function(v) { file.write(v.join(', ') + '\n'); });
    file.end();
  }
};
