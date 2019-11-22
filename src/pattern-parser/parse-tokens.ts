import { AffixToken, parseAffixToken } from './affix-tokens'
import { NumberToken, parseNumberToken } from './number-tokens'

function parseSubpattern(src: string, pos: number) {
  enum State {
    Prefix,
    Number,
    Suffix
  }

  const prefix: AffixToken[] = []
  const number: NumberToken[] = []
  const suffix: AffixToken[] = []

  let state: State = State.Prefix
  let str = ''
  while (pos < src.length) {
    const char = src[pos]
    if (char === ';') {
      pos += 1
      break
    }

    switch (state) {
      case State.Prefix: {
        const token = parseAffixToken(src, pos)
        if (token) {
          if (str) {
            prefix.push({ char: "'", str, width: str.length })
            str = ''
          }
          prefix.push(token)
          pos += token.width
        } else {
          const token = parseNumberToken(src, pos)
          if (token) {
            if (str) {
              prefix.push({ char: "'", str, width: str.length })
              str = ''
            }
            state = State.Number
            number.push(token)
            pos += token.width
          } else {
            str += char
            pos += 1
          }
        }
        break
      }

      case State.Number: {
        const token = parseNumberToken(src, pos)
        if (token) {
          number.push(token)
          pos += token.width
        } else {
          state = State.Suffix
        }
        break
      }

      case State.Suffix: {
        const token = parseAffixToken(src, pos)
        if (token) {
          if (str) {
            suffix.push({ char: "'", str, width: str.length })
            str = ''
          }
          suffix.push(token)
          pos += token.width
        } else {
          str += char
          pos += 1
        }
        break
      }
    }
  }
  if (str) suffix.push({ char: "'", str, width: str.length })
  return { pattern: { prefix, number, suffix }, pos }
}

export function parseTokens(src: string) {
  const { pattern, pos } = parseSubpattern(src, 0)
  if (pos < src.length) {
    const { pattern: negative } = parseSubpattern(src, pos)
    return { tokens: pattern, negative }
  }
  return { tokens: pattern }
}
