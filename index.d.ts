declare module "@rplan/logger" {
  import BunyanLogger = require('bunyan')

  class Logger extends BunyanLogger {
    withNamespace(namespace: string): Logger
  }

  function createLogger(namespace: string): Logger

  export = createLogger
}
