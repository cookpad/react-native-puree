// persistent queue using AsyncStorage
// @ts-ignore: Cannot find module
import { AsyncStorage } from 'react-native'
import * as uuid from 'react-native-uuid'

export interface QueueItem {
  uuid: string
  data: any
}

export default class Queue {
  static STORAGE_KEY = 'react-native-puree:queue'

  buffer: QueueItem[]

  async push (data: any): Promise<QueueItem> {
    if (!this.buffer) await this._init()

    const item = { uuid: uuid.v4(), data }
    this.buffer.push(item)
    await this._sync()
    return item
  }

  async get (size?: number): Promise<QueueItem[]> {
    if (!this.buffer) await this._init()

    return this.buffer.slice(0, size)
  }

  async remove (items: QueueItem[]): Promise<void> {
    const uuids = items.map(item => item.uuid)
    this.buffer = this.buffer.filter(item => {
      return !uuids.includes(item.uuid)
    })

    return this._sync()
  }

  async _init () {
    const jsonString = await AsyncStorage.getItem(Queue.STORAGE_KEY)
    if (jsonString) {
      this.buffer = JSON.parse(jsonString)
    } else {
      this.buffer = []
      await this._sync()
    }
  }

  async _sync (): Promise<void> {
    return AsyncStorage.setItem(Queue.STORAGE_KEY, JSON.stringify(this.buffer))
  }
}
