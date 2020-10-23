const JWT_REGEX = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_+/=]*/g
export const REDACT_TEXT = '<<REDACTED JWT>>'
const BITS_IN_BYTES = 8

const fromBase64 = value => Buffer.from(value, 'base64').toString('ascii')

const isRegExp = value => value instanceof RegExp
const isDate = value => value instanceof Date
const isString = value => typeof value === 'string'
const isArray = value => Array.isArray(value)
const isObject = value => typeof value === 'object'

const isJWTStart = (value) => {
  const [headers, payload] = value.split('.')

  try {
    // JWT headers and payload must be valid JSON
    JSON.parse(fromBase64(payload))
    JSON.parse(fromBase64(headers))

    return true
  } catch (err) {
    return false
  }
}

const isJWTEnd = (value) => {
  const [headers,, signature] = value.split('.')

  try {
    // Number of bytes in JWT signature must be at least
    // the number of bytes specified by the hashing algorithm
    const { alg } = JSON.parse(fromBase64(headers))
    const expectedBytes = parseInt(alg.substring(2), 10) / BITS_IN_BYTES
    const actualBytes = Buffer.byteLength(fromBase64(signature), 'utf8')

    return actualBytes >= expectedBytes
  } catch (err) {
    return false
  }
}

const replaceJwtOccurrences = message => message.replace(JWT_REGEX, (occurrence) => {
  let actualJwt = occurrence

  while (!isJWTStart(actualJwt) && actualJwt.length) {
    actualJwt = actualJwt.substring(1)
  }

  while (!isJWTEnd(actualJwt) && actualJwt.length) {
    actualJwt = actualJwt.slice(0, -1)
  }

  // If we have a match, then `actualJwt` will contain the
  // jwt token, otherwise we end up with an empty string
  return actualJwt ? occurrence.replace(actualJwt, REDACT_TEXT) : occurrence
})

export const redact = (message) => {
  if (isString(message)) {
    return replaceJwtOccurrences(message)
  }

  if (isArray(message)) {
    return message.map(redact)
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
        return { ...acc, [key]: value.map(redact) }
      }

      if (isObject(value)) {
        return { ...acc, [key]: redact(value) }
      }

      return { ...acc, [key]: value }
    }, {})
  }

  return message
}

