import * as mock from 'mock-require'
mock('react-native', {
  AsyncStorage: {
    async setItem (key, value) {
      this.database = this.database || {}
      this.database[key] = value
    },

    async getItem (key) {
      this.database = this.database || {}
      return this.database[key]
    },

    async clear () {
      this.database = {}
    }
  }
})
