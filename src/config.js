import bunyan from 'bunyan'
import bunyanDebugStream from 'bunyan-debug-stream'
import config from '@rplan/config'
import { RedactorStream } from './redact'

const getLogLevel = () => {
  if (config.getBoolean('RPLAN_LOGGER_OFF')) {
    return bunyan.FATAL + 1
  }

  return config.get('LOG_LEVEL')
}

const LOG_LEVEL = getLogLevel()
const LOG_HUMAN_READABLE = config.getBoolean('logging:human_readable')

const humanReadableStream = () => ({
  level: LOG_LEVEL,
  type: 'raw',
  stream: new RedactorStream(
    bunyanDebugStream({ forceColor: true }),
    { outputObjectMode: true },
  ),
})

const defaultStream = () => ({
  level: LOG_LEVEL,
  type: 'raw',
  stream: new RedactorStream(
    process.stdout,
    { outputObjectMode: false },
  ),
})

const getStreams = () => {
  if (LOG_HUMAN_READABLE) {
    return [humanReadableStream()]
  }

  return [defaultStream()]
}

const loggerConfig = {
  name: config.get('logging:root_logger_name'),
  streams: getStreams(),
  serializers: bunyan.stdSerializers,
  namespace: 'rplan',
}

export default loggerConfig
