// make it singleton for testing purpose
import { TransakEventStatus } from '../src/services/types'

type Callback = (args?: any[]) => any
type Listener = { name?: string; callback: Callback }

export class PusherMockImplementation {
  listeners: Listener[]
  constructor(apiKey: string, opt: any) {
    this.listeners = []
  }

  subscribe(name: string) {
    return this
  }

  bind(name: string, callback: Callback) {
    this.listeners.push({ name, callback })
  }

  bind_global(callback: Callback) {
    this.listeners.push({ callback })
  }

  get global_emitter() {
    return {
      emit: this.emit.bind(this),
    }
  }

  get connection() {
    return {
      bind: this.bind.bind(this),
    }
  }

  listenerCount(name = ''): number {
    if (!name) {
      this.listeners.length
    }
    return this.listeners.filter((listener) => listener.name === name).length
  }

  removeAllListeners(name = '') {
    if (!name) {
      this.listeners = []
    }
    this.listeners = this.listeners.filter((listener) => listener.name === name)
  }

  emit(name: string, ...args: any) {
    this.listeners
      .filter(
        (listener) => listener.name === name || listener.name === undefined
      )
      .forEach(({ callback }) => callback(...args))
  }
}

export default PusherMockImplementation
