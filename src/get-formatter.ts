import { SkeletonError } from './errors'
import { getNumberFormatLocales } from './numberformat/locales'
import {
  getNumberFormatModifier,
  getNumberFormatModifierSource
} from './numberformat/modifier'
import { getNumberFormatOptions } from './numberformat/options'
import { parseSkeleton } from './parser/parse-skeleton'

/**
 * Returns a number formatter function for the given locales and skeleton source.
 *
 * @remarks
 * Uses `Intl.NumberFormat` internally, including features provided by the
 * {@link https://github.com/tc39/proposal-unified-intl-numberformat | Unified
 * API Proposal}. If the error callback is defined, it will be called separately
 * for each encountered parsing error and unsupported feature.
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
  const skeleton = parseSkeleton(src, onError)
  const lc = getNumberFormatLocales(locales, skeleton)
  const opt = getNumberFormatOptions(skeleton, onError)
  const mod = getNumberFormatModifier(skeleton)
  const nf = new Intl.NumberFormat(lc, opt)
  return (value: number) => nf.format(mod(value))
}

/**
 * Returns a string of JavaScript source that evaluates to a number formatter
 * function with the same `(value: number) => string` signature as the function
 * returned by {@link getFormatter}.
 *
 * @remarks
 * The returned function will memoize an `Intl.NumberFormat` instance that makes
 * use of features provided by the {@link
 * https://github.com/tc39/proposal-unified-intl-numberformat | Unified API
 * Proposal}. If the error callback is defined, it will be called separately for
 * each encountered parsing error and unsupported feature.
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
 * // '  var mod = function(n) { return n * 0.01; };\n' +
 * // '  return function(value) { return nf.format(mod(value)); }\n' +
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
  const skeleton = parseSkeleton(src, onError)
  const lc = getNumberFormatLocales(locales, skeleton)
  const opt = getNumberFormatOptions(skeleton, onError)
  const modSrc = getNumberFormatModifierSource(skeleton)
  const lines = [
    `(function() {`,
    `var opt = ${JSON.stringify(opt)};`,
    `var nf = new Intl.NumberFormat(${JSON.stringify(lc)}, opt);`
  ]
  if (modSrc) {
    lines.push(
      `var mod = ${modSrc};`,
      `return function(value) { return nf.format(mod(value)); }`
    )
  } else {
    lines.push(`return function(value) { return nf.format(value); }`)
  }
  return lines.join('\n  ') + '\n})()'
}
