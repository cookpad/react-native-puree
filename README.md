# react-native-puree
[![Build Status](https://travis-ci.org/cookpad/react-native-puree.svg?branch=master)](https://travis-ci.org/cookpad/react-native-puree)

A log collector for React Native.

Features:

- Buffering: Store logs to AsyncStorage and send them later
- Batching: Send logs in a single request
- Retrying: Retry to send logs after backoff time if sending logs fails

```js
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

// send log
puree.send({ event: 'click', recipe_id: 1234 })
```
