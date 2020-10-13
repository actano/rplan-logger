const JWT_REGEX = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/
const REDACT_TEXT = '<<REDACTED JWT>>'

const isRegExp = value => value instanceof RegExp
const isDate = value => value instanceof Date

const isJWT = (occurrence) => {
  const [, payload] = occurrence.split('.')

  try {
    const decodedPayload = Buffer.from(payload, 'base64').toString()
    const { iat, exp } = JSON.parse(decodedPayload)

    return !!iat && !!exp
  } catch (err) {
    return false
  }
}

const replaceJwtOccurrences = message => message.replace(
  JWT_REGEX,
  occurrence => (isJWT(occurrence) ? REDACT_TEXT : occurrence),
)

const redactSensitiveData = (message) => {
  if (typeof message === 'string') {
    return replaceJwtOccurrences(message)
  }

  if (Array.isArray(message)) {
    return message.map(redactSensitiveData)
  }

  if (isDate(message) || isRegExp(message)) {
    return message
  }

  if (typeof message === 'object') {
    return Object.entries(message).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        return { ...acc, [key]: replaceJwtOccurrences(value) }
      }

      if (Array.isArray(value)) {
        return { ...acc, [key]: value.map(redactSensitiveData) }
      }

      if (typeof value === 'object') {
        return { ...acc, [key]: redactSensitiveData(value) }
      }

      return { ...acc, [key]: value }
    }, {})
  }

  return message
}

export const redact = (args) => {
  const [message, ...rest] = args
  const redactedMessage = redactSensitiveData(message)
  return [redactedMessage, ...rest]
}
