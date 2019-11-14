/**
 * Tools for working with
 * {@link https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md | ICU NumberFormatter skeletons}.
 *
 * ```js
 * import {
 *  getFormatter,
 *  getFormatterSource,
 *  parseSkeleton,
 *  Skeleton,
 *  SkeletonError,
 *  Unit
 * } from 'messageformat-number-skeleton'
 * ```
 *
 * @packageDocumentation
 */

export {
  BadOptionError,
  BadStemError,
  MaskedValueError,
  MissingOptionError,
  SkeletonError,
  TooManyOptionsError,
  UnsupportedError
} from './errors'
export { getFormatter, getFormatterSource } from './get-formatter'
export { parseSkeleton } from './parser/parse-skeleton'
export { Skeleton } from './types/skeleton'
export { Unit } from './types/unit'
