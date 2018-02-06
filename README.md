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
