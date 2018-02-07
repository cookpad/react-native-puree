import test from 'ava'
import './_mock-async-storage'
import Queue from '../queue'
import { AsyncStorage } from 'react-native'

test.beforeEach(async () => {
  await AsyncStorage.clear()
})

test.serial('get', async t => {
  const queue = new Queue()
  t.deepEqual(await queue.get(), [])

  for (let i = 0; i < 3; i++) {
    await queue.push({ id: i + 1, event: 'click' })
  }

  t.deepEqual(
    (await queue.get(2)).map(item => item.data.id),
    [1, 2]
  )
})

test.serial('remove', async t => {
  const queue = new Queue()

  for (let i = 0; i < 6; i++) {
    await queue.push({ id: i, event: 'click' })
  }

  const items = await queue.get()
  await queue.remove(items.slice(2, 4))

  t.deepEqual(
    (await queue.get()).map(item => item.data.id),
    [0, 1, 4, 5]
  )
})
