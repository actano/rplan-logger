import bunyan from 'bunyan'
import bunyanDebugStream from 'bunyan-debug-stream'
import config from '@rplan/config'

const LOG_LEVEL = config.get('LOG_LEVEL')
const LOG_HUMAN_READABLE = config.getBoolean('logging:human_readable')

const humanReadableStream = () => ({
  level: LOG_LEVEL,
  type: 'raw',
  stream: bunyanDebugStream({ forceColor: true }),
})

const defaultStream = () => ({
  level: LOG_LEVEL,
  stream: process.stdout,
  type: 'stream',
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
