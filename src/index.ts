import Queue, { QueueItem } from './queue'

export type Log = object
export type OutputHandler = (logs: Log[]) => Promise<void>
export type PureeFilter = (log: Log) => Log

declare var global: any

function debugLog (message: string) {
  if (global.__DEV__) {
    console.log(`[puree] ${message}`)
  }
}

async function wait (interval: number) {
  await new Promise((resolve) => { setTimeout(resolve, interval) })
}

export interface PureeConfig {
  flushInterval?: number
  maxRetry?: number
  firstRetryInterval?: number
}

export default class Puree {
  static DEFAULT_FLUSH_INTERVAL = 2 * 60 * 1000
  static LOG_LIMIT = 10
  static DEFAULT_MAX_RETRY = 5
  static DEFAULT_FIRST_RETRY_INTERVAL = 1 * 1000

  queue: Queue
  buffer: QueueItem[]
  filters: PureeFilter[]

  // config
  flushInterval: number
  maxRetry: number
  firstRetryInterval: number

  private flushHandler: OutputHandler

  constructor (config: PureeConfig = {}) {
    this.queue = new Queue()
    this.filters = []
    this.flushInterval = config.flushInterval || Puree.DEFAULT_FLUSH_INTERVAL
    this.maxRetry = config.maxRetry || Puree.DEFAULT_MAX_RETRY
    this.firstRetryInterval = config.firstRetryInterval || Puree.DEFAULT_FIRST_RETRY_INTERVAL
  }

  addFilter (f: PureeFilter) {
    this.filters.push(f)
  }

  addOutput (handler: OutputHandler) {
    this.flushHandler = handler
  }

  async start () {
    await this.flush()

    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  async send (log: Log) {
    log = this.applyFilters(log)

    if (this.buffer === undefined) await this.initBuffer()
    const queueItem = await this.queue.push(log)
    this.buffer.push(queueItem)

    debugLog(`Recorded a log: ${JSON.stringify(log)}`)
  }

  applyFilters (value): Log {
    this.filters.forEach(f => {
      value = f(value)
    })

    return value
  }

  async flush () {
    if (this.buffer === undefined) await this.initBuffer()
    const items = this.buffer.splice(0, Puree.LOG_LIMIT)

    if (items.length === 0) return
    debugLog(`Flushing ${items.length} logs`)

    const logs = items.map(item => item.data)

    const handledError = await this.process(logs)
    if (handledError) {
      console.error(handledError)
      return
    }

    debugLog(`Finished processing logs: ${JSON.stringify(logs)}`)

    return this.queue.remove(items)
  }

  private async process (logs: Log[], retryCount = 0): Promise<Error> {
    if (retryCount > this.maxRetry) {
      return new Error('retryCount exceeded max retry')
    }

    try {
      await this.flushHandler(logs)
    } catch {
      await wait(Math.pow(2, retryCount) * this.firstRetryInterval)
      return this.process(logs, retryCount + 1)
    }
  }

  private async initBuffer () {
    this.buffer = await this.queue.get()
  }
}
