import BunyanLogger from 'bunyan'

import config from './config'

class Logger extends BunyanLogger {
  withNamespace(namespace) {
    const parentNamespace = this.fields.namespace
    const childNamespace = parentNamespace ? `${parentNamespace}.${namespace}` : namespace
    return this.child({ namespace: childNamespace })
  }
}

const rootLogger = new Logger(config)

export default function (namespace) {
  return rootLogger.withNamespace(namespace)
}
