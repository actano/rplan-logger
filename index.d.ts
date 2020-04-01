declare module "@rplan/logger" {
  import BunyanLogger = require('bunyan')

  export class Logger extends BunyanLogger {
    withNamespace(namespace: string): Logger
  }

  export default function createLogger(namespace: string): Logger
}
