const JWT_REGEX = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/
const REDACT_TEXT = '<<REDACTED JWT>>'

const isRegExp = value => value instanceof RegExp
const isDate = value => value instanceof Date
const isString = value => typeof value === 'string'
const isArray = value => Array.isArray(value)
const isObject = value => typeof value === 'object'
const isJWT = (value) => {
  const [, payload] = value.split('.')

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
  if (isString(message)) {
    return replaceJwtOccurrences(message)
  }

  if (isArray(message)) {
    return message.map(redactSensitiveData)
  }

  if (isDate(message) || isRegExp(message)) {
    return message
  }

  if (isObject(message)) {
    return Object.entries(message).reduce((acc, [key, value]) => {
      if (isString(value)) {
        return { ...acc, [key]: replaceJwtOccurrences(value) }
      }

      if (isArray(value)) {
        return { ...acc, [key]: value.map(redactSensitiveData) }
      }

      if (isObject(value)) {
        return { ...acc, [key]: redactSensitiveData(value) }
      }

      return { ...acc, [key]: value }
    }, {})
  }

  return message
}

export const redact = ([message, ...rest]) => {
  return [redactSensitiveData(message), ...rest]
}
