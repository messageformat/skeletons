import { Skeleton } from './types/skeleton'
import { AffixToken } from './pattern-parser/affix-tokens'
import { parseTokens } from './pattern-parser/parse-tokens'
import { parseNumberAsSkeleton } from './pattern-parser/number-as-skeleton'

function handleAffix(
  affixTokens: AffixToken[],
  res: Skeleton,
  currency: string | undefined,
  isPrefix: boolean
) {
  let inFmt = false
  let str = ''
  for (const token of affixTokens) {
    switch (token.char) {
      case '%':
        res.unit = { style: token.style }
        if (isPrefix) inFmt = true
        else str = ''
        break

      case '¤':
        if (!currency) throw new Error('The ¤ pattern requires a currency')
        res.unit = { style: 'currency', currency }
        switch (token.currency) {
          case 'iso-code':
            res.unitWidth = 'unit-width-iso-code'
            break
          case 'full-name':
            res.unitWidth = 'unit-width-full-name'
            break
          case 'narrow':
            res.unitWidth = 'unit-width-narrow'
            break
        }
        if (isPrefix) inFmt = true
        else str = ''
        break

      case '*':
        // TODO
        break

      case '+':
        if (!inFmt) str += '+'
        break

      case "'":
        if (!inFmt) str += token.str
        break
    }
  }
  return str
}

function getNegativeAffix(affixTokens: AffixToken[], isPrefix: boolean) {
  let inFmt = false
  let str = ''
  for (const token of affixTokens) {
    switch (token.char) {
      case '%':
      case '¤':
        if (isPrefix) inFmt = true
        else str = ''
        break
      case '-':
        if (!inFmt) str += '-'
        break
      case "'":
        if (!inFmt) str += token.str
        break
    }
  }
  return str
}

/**
 * Parse an {@link
 * http://unicode.org/reports/tr35/tr35-numbers.html#Number_Format_Patterns |
 * ICU NumberFormatter pattern} string into a {@link Skeleton} structure.
 *
 * @public
 * @param src - The pattern string
 * @param currency - If the pattern includes ¤ tokens, their skeleton
 *   representation requires a three-letter currency code.
 *
 * @remarks
 * Unlike the skeleton parser, the pattern parser is not able to return partial
 * results on error, and will instead throw. Output padding is not supported.
 *
 * @example
 * ```js
 * import { parseSkeleton } from 'messageformat-number-skeleton'
 *
 * parseSkeleton('compact-short currency/GBP', console.error)
 * // {
 * //   notation: { style: 'compact-short' },
 * //   unit: { style: 'currency', currency: 'GBP' }
 * // }
 * ```
 */
export function parsePattern(src: string, currency?: string) {
  const { tokens, negative } = parseTokens(src)
  const res = parseNumberAsSkeleton(tokens.number)

  const prefix = handleAffix(tokens.prefix, res, currency, true)
  const suffix = handleAffix(tokens.suffix, res, currency, false)
  if (negative) {
    const negPrefix = getNegativeAffix(negative.prefix, true)
    const negSuffix = getNegativeAffix(negative.suffix, false)
    res.affix = { pos: [prefix, suffix], neg: [negPrefix, negSuffix] }
    res.sign = 'sign-never'
  } else if (prefix || suffix) {
    res.affix = { pos: [prefix, suffix] }
  }

  return res
}
