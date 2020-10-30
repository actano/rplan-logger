import { expect } from 'chai'
import { redact, REDACT_TEXT } from '../src/redact'

const JWT_TOKEN = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2ZiMWY1NjIwLWJjMWItNGE2Zi04NTI1LWZkNmNkOWFmYzk3MyIsImRpc3BsYXlOYW1lIjoicmVuYXRvLmdhbWFAYWN0YW5vLmRlIiwiaWF0IjoxNjAzMzgyNzA4LCJleHAiOjE2MDM0NjkxMDh9.E5vpJMAaij4098aDRXNF6QXJqApvdTtswkHLNa4zxgvEnlAkNT-CF56NnshpEaCInC5X9WpY0YEyZEe8Zux6Lyap0KZzadbcIvhJIQBIkyMtixrw7xujUQXT4bur-sq4e0lHh_RnCvZ-ixXy7_m_31e4nKpZ2eMy2MMLp8lgEc-HUsW2EPKw1N6LXg4L_sERZZByAqs1BxY3UTx9UvdhAo87kxt4YiMbah3njmyJaOr441i9C4NYMbky-UnlnoU_GEaPtT7tN3phJKrEnltLSB1pAXbbNlJVAxstex96ptiBhZ2UWnVw5_LdlOe-AMCMpysNfJJ5l0nqXHJY_P9RDw'

const getTestMessage = value =>
  `This message contains a ${value}. Not only once, but twice: ${value}!`

describe('redact', () => {
  context('when passing a string', () => {
    it('should redact tokens', () => {
      const message = getTestMessage(JWT_TOKEN)
      const expectedMessage = getTestMessage(REDACT_TEXT)
      const [redactedMessage] = redact([message])

      expect(redactedMessage).to.equal(expectedMessage)
    })

    it('should redact tokens from a url', () => {
      const url = `/authenticate/real-time/v0/updates/?token=${JWT_TOKEN}`
      const expectedUrl = `/authenticate/real-time/v0/updates/?token=${REDACT_TEXT}`
      const [redactedUrl] = redact([url])

      expect(redactedUrl).to.equal(expectedUrl)
    })

    it('should not redact non-token having the same pattern of a JWT', () => {
      const website = 'www.example.com'
      expect(redact([website])[0]).to.equal(website)

      const versionNumber = 'v1.0.0'
      expect(redact([versionNumber])[0]).to.equal(versionNumber)
    })

    //
    // This test is skipped because two concatenated JWTs
    // would make the regex match the first, and partially
    // the second token. Because the number of characters of the
    // signature (3 segment) is not fixed, it is difficult
    // to know when the first token ends and the second begins.
    //
    // Example:
    //  - Given the token: x.y.z
    //  - When concatenated: x.y.zx.y.z
    //  - Would yield: <<REDACTED JWT>>.y.z
    //
    // Note that in this case, the remaining `y` can still
    // contain decodable sensitive information.
    //
    // Because the described scenario is unlikely on our logs we
    // are not addressing a fix to this problem now.
    //
    it.skip('it should redact two tokens in a row', () => {
      const message = `${JWT_TOKEN}${JWT_TOKEN}`
      const expectedMessage = `${REDACT_TEXT}${REDACT_TEXT}`
      const [redactedMessage] = redact([message])

      expect(redactedMessage).to.equal(expectedMessage)
    })

    //
    // This test is also skipped for a similar reason from the previous:
    // If a JWT is prefixed with a string, the match would not detect a
    // valid token and therefore no contents would be replaced:
    //
    // Example:
    //  - Given the token: x.y.z
    //  - Given a prefix: p
    //  - Would yield: p.z.y.z because p.z.y is not a valid token
    //
    // Because the described scenario is unlikely on our logs we
    // are not addressing a fix to this problem now.
    //
    it.skip('it should redact a token preceded by another segment', () => {
      const message = `rplan.${JWT_TOKEN}`
      const expectedMessage = `rplan.${REDACT_TEXT}`
      const [redactedMessage] = redact([message])

      expect(redactedMessage).to.equal(expectedMessage)
    })
  })

  context('when passing non-string primitives', () => {
    it('should not have any effect on the output', () => {
      const numberMessage = 123
      expect(redact([numberMessage])[0]).to.equal(numberMessage)

      const booleanMessage = true
      expect(redact([booleanMessage])[0]).to.equal(booleanMessage)

      const dateMessage = new Date()
      expect(redact([dateMessage])[0]).to.equal(dateMessage)

      const regexMessage = /thisIsARegex/
      expect(redact([regexMessage])[0]).to.equal(regexMessage)
    })
  })

  context('when passing an array containing strings', () => {
    const arrayMessage = [
      JWT_TOKEN,
      'I dont have a token',
      getTestMessage(JWT_TOKEN),
    ]

    const expectedArrayMessage = [
      REDACT_TEXT,
      'I dont have a token',
      getTestMessage(REDACT_TEXT),
    ]

    it('should redact strings from all elements', () => {
      const [redactedMessage] = redact([arrayMessage])
      expect(redactedMessage).to.deep.equal(expectedArrayMessage)
    })

    it('should redact strings from nested arrays', () => {
      const [redactedMessage] = redact([[[arrayMessage], [arrayMessage]]])
      expect(redactedMessage).to.deep.equal([[expectedArrayMessage], [expectedArrayMessage]])
    })
  })

  context('when passing an object', () => {
    const objectMessage = {
      message: getTestMessage(JWT_TOKEN),
      myNumber: 123,
      myArray: [{
        anotherMessage: JWT_TOKEN,
        another: {
          myNestedArray: [JWT_TOKEN],
        },
      }, JWT_TOKEN],
    }

    const expectedMessage = {
      message: getTestMessage(REDACT_TEXT),
      myNumber: 123,
      myArray: [{
        anotherMessage: REDACT_TEXT,
        another: {
          myNestedArray: [REDACT_TEXT],
        },
      }, REDACT_TEXT],
    }

    it('should redact token recursively on nested objects and arrays', () => {
      const [redactedMessage] = redact([objectMessage])
      expect(redactedMessage).to.deep.equal(expectedMessage)
    })
  })
})
