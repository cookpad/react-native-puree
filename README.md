# react-native-puree
[![Build Status](https://travis-ci.org/cookpad/react-native-puree.svg?branch=master)](https://travis-ci.org/cookpad/react-native-puree) [![npm](https://img.shields.io/npm/v/react-native-puree.svg)](https://www.npmjs.com/package/react-native-puree)

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


## Usage
### Configure
```js
const puree = new Puree({
  flushInterval: 2 * 60 * 1000, // the interval to flush logs in milli second
  maxRetry: 5                   // try to send logs until max retry count
  firstRetryInterval: 1 * 1000  // the interval between the fail to send logs and the first retry
})
```

### Record logs
```js
puree.send({ event: 'click', recipe_id: 1234 })
```

A log is stored into persistent storage ( [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) ) after applying filters to it. 

### Flush logs
You can automatically send logs every interval with `puree.start()`.

```js
puree.start()
```

or manually:

```js
puree.flush()
```


## Recipe

### Flush logs on resume

Use `AppState` and `puree.flush()`.

See also: https://facebook.github.io/react-native/docs/appstate.html

```js
import { AppState } from 'react-native'

class AppRoot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  onForeground () {
    puree.flush();
  }

  // https://facebook.github.io/react-native/docs/appstate.html
  _handleAppStateChange = (nextAppState: string) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.onForeground();
    }

    this.setState({ appState: nextAppState });
  }

  render() {
    return (
      <App/>
    );
  }
}
```

## Link
- [puree-android](https://github.com/cookpad/puree-android)
- [puree-ios](https://github.com/cookpad/puree-ios)

## License
MIT
