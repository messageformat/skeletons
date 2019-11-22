import { SkeletonError } from './errors'
import { Skeleton } from './types/skeleton'
import { TokenParser } from './skeleton-parser/token-parser'

/**
 * Parse an input skeleton string into a {@link Skeleton} structure.
 *
 * @public
 * @param src - The skeleton string, consisting of {@link
 *   https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md
 *   | space-separated tokens}
 * @param onError - If defined, will be called when the parser encounters a
 *   syntax error. The function will still return a {@link Skeleton}, but it may
 *   not contain information for all tokens.
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
export function parseSkeleton(
  src: string,
  onError?: (err: SkeletonError) => void
): Skeleton {
  const tokens = []
  for (const part of src.split(' ')) {
    if (part) {
      const options = part.split('/')
      const stem = options.shift() || ''
      tokens.push({ stem, options })
    }
  }

  const parser = new TokenParser(onError)
  for (const { stem, options } of tokens) {
    parser.parseToken(stem, options)
  }
  return parser.skeleton
}
