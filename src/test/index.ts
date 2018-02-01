import test from 'ava'
import './_mock-async-storage'
import Puree from '../'
// @ts-ignore: Cannot find module
import { AsyncStorage } from 'react-native'

function addEventTime (log) {
  return Object.assign({ time: Math.floor(new Date().getTime() / 1000) }, log)
}

async function wait (interval) {
  await new Promise((resolve) => { setTimeout(resolve, interval) })
}

test.beforeEach(async () => {
  await AsyncStorage.clear()
})

test.serial('send log with filters', async t => {
  const puree = new Puree()

  puree.addOutput(async logs => {
    t.is(logs.length, 1)
    t.is((logs[0] as any).table_name, 'foobar')
    t.is((logs[0] as any).action, 'click')
  })

  puree.addFilter(addEventTime)
  puree.addFilter(log => {
    return Object.assign(log, { table_name: 'foobar' })
  })

  await puree.send({ action: 'click' })
  await puree.flush()
})

test.serial('flush logs', async t => {
  const puree = new Puree()

  let called = 0
  puree.addOutput(async logs => {
    called += 1
    t.is(logs.length, 1)
    t.deepEqual(logs, [
      { action: 'click' }
    ])
  })

  await puree.flush() // logs should be empty

  await puree.send({ action: 'click' })
  await puree.flush()

  await puree.flush() // logs should be empty
  t.is(called, 1)
})

test.serial('flush after the interval', async t => {
  const puree = new Puree({ flushInterval: 1 * 10 })

  puree.addFilter(addEventTime)
  puree.addOutput(async (logs) => {
    t.pass()
  })

  await puree.start()

  puree.send({ action: 'click' })
  await wait(2 * 10)
})

test.serial('retry with exponential backoff', async t => {
  const puree = new Puree({ flushInterval: 10 })

  let called = 0
  puree.addOutput(async logs => {
    called += 1
    throw new Error('wtf')
  })

  await puree.start()
  puree.send({ action: 'click' })

  await wait(10 * 1)
  t.is(called, 1)

  await wait(50)
  t.is(called, 1)

  await wait(1 * 1000)
  t.is(called, 2)

  await wait(2 * 1000)
  t.is(called, 3)
})

test.serial('max retry', async t => {
  const maxRetry = 2
  const puree = new Puree({ maxRetry, flushInterval: 10, firstRetryInterval: 10 })

  let called = 0
  puree.addOutput(async logs => {
    called += 1
    throw new Error('wtf')
  })

  await puree.start()
  puree.send({ action: 'click' })

  await wait(10 * 10)
  t.is(called, maxRetry + 1)
})
