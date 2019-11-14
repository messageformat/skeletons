import { SkeletonError } from './errors'
import { getNumberFormatLocales } from './nf-locales'
import { getNumberFormatMultiplier } from './nf-multiplier'
import { getNumberFormatOptions } from './nf-options'
import { parseSkeleton } from './parse'

function getNumberFormatVariables(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const skeleton = parseSkeleton(src, onError)
  const lc = getNumberFormatLocales(locales, skeleton)
  const opt = getNumberFormatOptions(skeleton, onError)
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
 * ```js
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

/**
 * Returns a string of JavaScript source that evaluates to a number formatter
 * function with the same `(value: number) => string` signature as the function
 * returned by {@link getFormatter}.
 *
 * @remarks
 * The returned function will memoize an `Intl.NumberFormat` instance. If the
 * error callback is defined, it will be called separately for each encountered
 * parsing error and unsupported feature.
 *
 * @public
 * @example
 * ```js
 * import { getFormatterSource } from 'messageformat-number-skeleton'
 *
 * getFormatterSource('en', 'percent', console.error)
 * // '(function() {\n' +
 * // '  var opt = {"style":"percent"};\n' +
 * // '  var nf = new Intl.NumberFormat(["en"], opt);\n' +
 * // '  return function(value) { return nf.format(0.01 * value); }\n' +
 * // '})()'
 *
 * const src = getFormatterSource('en-CA', 'currency/CAD unit-width-narrow', console.error)
 * // '(function() {\n' +
 * // '  var opt = {"style":"currency","currency":"CAD","currencyDisplay":"narrowSymbol","unitDisplay":"narrow"};\n' +
 * // '  var nf = new Intl.NumberFormat(["en-CA"], opt);\n'
 * // '  return function(value) { return nf.format(value); }\n' +
 * // '})()'
 * const fmt = new Function(`return ${src}`)()
 * fmt(42) // '$42.00'
 * ```
 */
export function getFormatterSource(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { lc, opt, mult } = getNumberFormatVariables(locales, src, onError)
  const valueExp = mult === 1 || isNaN(mult) ? `value` : `${mult} * value`
  const source = `
(function() {
  var opt = ${JSON.stringify(opt)};
  var nf = new Intl.NumberFormat(${JSON.stringify(lc)}, opt);
  return function(value) { return nf.format(${valueExp}); }
})()`
  return source.trim()
}
