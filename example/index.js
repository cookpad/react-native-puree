import Puree from 'react-native-puree'

function epochTime () {
  return Math.floor(new Date().getTime() / 1000)
}

const puree = new Puree()
puree.addFilter(function addTableName(log) {
  return Object.assign({ table_name: 'table' }, log)
});

puree.addFilter(function addEventTime(log) {
  return Object.assign({ time: epochTime() }, log)
})

puree.addOutput(async (logs) => {
  console.log(logs)
})

puree.start()

puree.send({ event: 'click', recipe_id: 1234 })
