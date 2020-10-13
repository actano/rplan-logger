import BunyanLogger from 'bunyan'

import config from './config'
import { redact } from './redact'

class Logger extends BunyanLogger {
  withNamespace(namespace) {
    const parentNamespace = this.fields.namespace
    const childNamespace = parentNamespace ? `${parentNamespace}.${namespace}` : namespace
    return this.child({ namespace: childNamespace })
  }

  debug(...args) {
    super.debug(...redact(args))
  }

  error(...args) {
    super.error(...redact(args))
  }

  info(...args) {
    super.info(...redact(args))
  }

  trace(...args) {
    super.trace(...redact(args))
  }

  warn(...args) {
    super.warn(...redact(args))
  }
}

const rootLogger = new Logger(config)

export default function (namespace) {
  return rootLogger.withNamespace(namespace)
}
