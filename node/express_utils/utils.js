function URLize(input){
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}

const pjson = require('../package.json');
const log = {
    data(data){
      console.log(`[${pjson.name}@${pjson.version}] `+data)
    },
    error(data){
      console.error(`[${pjson.name}@${pjson.version}] `+data)
    }
}

module.exports = { URLize, log };