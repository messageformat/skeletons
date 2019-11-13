import { UnsupportedError, SkeletonError } from './errors'
import { getNumberFormatLocales } from './nf-locales'
import { getNumberFormatMultiplier } from './nf-multiplier'
import { getNumberFormatOptions } from './nf-options'
import { parseSkeleton } from './parse'

function getNumberFormatVariables(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { errors, skeleton } = parseSkeleton(src)
  if (onError) for (const error of errors) onError(error)
  function handleUnsupported(stem: string, source?: string) {
    if (onError) onError(new UnsupportedError(stem, source))
  }
  const lc = getNumberFormatLocales(locales, skeleton)
  const opt = getNumberFormatOptions(skeleton, handleUnsupported)
  const mult = getNumberFormatMultiplier(skeleton)
  return { lc, opt, mult }
}

/**
 * Returns a number formatter function for the given locales and skeleton source.
 *
 * @remarks
 * Uses `Intl.NumberFormat` internally. If the error callback is defined, it
 * will be called separately for each encountered parsing error and unsupported
 * feature.
 *
 * @public
 * @example
 * ```
 * import { getFormatter } from 'messageformat-number-skeleton'
 *
 * let src = 'currency/CAD unit-width-narrow'
 * let fmt = getFormatter('en-CA', src, console.error)
 * fmt(42) // '$42.00'
 *
 * src = 'percent scale/100'
 * fmt = getFormatter('en', src, console.error)
 * fmt(0.3) // '30%'
 * ```
 */
export function getFormatter(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { lc, opt, mult } = getNumberFormatVariables(locales, src, onError)
  const nf = new Intl.NumberFormat(lc, opt)
  return (value: number) => nf.format(mult * value)
}

/** @public */
export function getFormatterSource(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { lc, opt, mult } = getNumberFormatVariables(locales, src, onError)
  const source = `
(function() {
  var nf = new Intl.NumberFormat(${JSON.stringify(lc)}, ${JSON.stringify(opt)});
  return function(value) { return nf.format(${JSON.stringify(mult)} * value); }
})()`
  return source.trim()
}
