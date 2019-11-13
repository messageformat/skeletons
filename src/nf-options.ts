import { Skeleton } from './skeleton'

/**
 * Extends `Intl.NumberFormat` options to include features brought by the
 * {@link https://github.com/tc39/proposal-unified-intl-numberformat | Unified API Proposal}
 *
 * @public
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  compactDisplay?: 'long' | 'short'
  currencySign?: 'standard' | 'accounting'
  notation?: 'standard' | 'engineering' | 'scientific' | 'compact'
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero'
  unit?: string
  unitDisplay?: 'long' | 'short' | 'narrow'
}

/**
 * Given an input ICU NumberFormatter skeleton, does its best to construct a
 * corresponding `Intl.NumberFormat` options structure.
 *
 * @remarks
 * In addition to standard `Intl.NumberFormat` options, some features make use
 * of the
 * {@link https://github.com/tc39/proposal-unified-intl-numberformat | Unified API Proposal},
 * which has limited support. If encountering unsupported features (e.g.
 * `decimal-always`, `permille`, others), the callback will be called with the
 * arguments `(stem: string, source?: string)`, where `source` may specify the
 * source of an unsupported option.
 *
 * @public
 * @example
 * ```js
 * import {
 *   getNumberFormatOptions,
 *   parseSkeleton
 * } from 'messageformat-number-skeleton'
 *
 * const logUnsupported = (stem, src) =>
 *   console.log('Unsupported:', stem, src || '')
 *
 * const src = 'currency/CAD unit-width-narrow'
 * const { errors, skeleton } = parseSkeleton(src)
 * // errors: []
 * // skeleton: {
 * //   unit: { style: 'currency', currency: 'CAD' },
 * //   unitWidth: 'unit-width-narrow'
 * // }
 *
 * getNumberFormatOptions(skeleton, logUnsupported)
 * // {
 * //   style: 'currency',
 * //   currency: 'CAD',
 * //   currencyDisplay: 'narrowSymbol',
 * //   unitDisplay: 'narrow'
 * // }
 *
 * const { skeleton: sk2 } = parseSkeleton('group-min2')
 * // { group: 'group-min2' }
 *
 * getNumberFormatOptions(sk2, logUnsupported)
 * // Unsupported: group-min2
 * // {}
 * ```
 */
export function getNumberFormatOptions(
  skeleton: Skeleton,
  onUnsupported: (stem: string, source?: string) => void
) {
  const {
    decimal,
    group,
    integerWidth,
    notation,
    precision,
    roundingMode,
    sign,
    unit,
    unitPer,
    unitWidth
  } = skeleton
  const opt: NumberFormatOptions = {}

  if (unit) {
    switch (unit.style) {
      case 'base-unit':
        opt.style = 'decimal'
        break
      case 'currency':
        opt.style = 'currency'
        opt.currency = unit.currency
        break
      case 'measure-unit':
        opt.style = 'unit'
        opt.unit = unit.unit.replace(/.*-/, '')
        if (unitPer) opt.unit += '-per-' + unitPer.replace(/.*-/, '')
        break
      case 'percent':
        opt.style = 'percent'
        break
      case 'permille':
        onUnsupported('permille')
        break
    }
  }

  switch (unitWidth) {
    case 'unit-width-full-name':
      opt.currencyDisplay = 'name'
      opt.unitDisplay = 'long'
      break
    case 'unit-width-hidden':
      onUnsupported(unitWidth)
      break
    case 'unit-width-iso-code':
      opt.currencyDisplay = 'code'
      break
    case 'unit-width-narrow':
      opt.currencyDisplay = 'narrowSymbol'
      opt.unitDisplay = 'narrow'
      break
    case 'unit-width-short':
      opt.currencyDisplay = 'symbol'
      opt.unitDisplay = 'short'
      break
  }

  switch (group) {
    case 'group-auto':
      opt.useGrouping = true
      break
    case 'group-off':
      opt.useGrouping = false
      break
    case 'group-min2':
    case 'group-on-aligned':
    case 'group-thousands':
      onUnsupported(group)
      break
  }

  if (integerWidth) {
    const { min, max, source } = integerWidth
    if (min > 0) opt.minimumIntegerDigits = min
    if (Number(max) > 0) onUnsupported('integer-width', source)
  }

  if (precision) {
    switch (precision.style) {
      case 'precision-fraction': {
        const {
          minFraction: minF,
          maxFraction: maxF,
          minSignificant: minS,
          maxSignificant: maxS,
          source
        } = precision
        if (typeof minF === 'number') {
          opt.minimumFractionDigits = minF
          if (typeof minS === 'number')
            onUnsupported('precision-fraction', source)
        }
        if (typeof maxF === 'number') opt.maximumFractionDigits = maxF
        if (typeof minS === 'number') opt.minimumSignificantDigits = minS
        if (typeof maxS === 'number') opt.maximumSignificantDigits = maxS
        break
      }
      case 'precision-integer':
        opt.maximumFractionDigits = 0
        break
      case 'precision-unlimited':
        opt.maximumFractionDigits = 20
        break
      case 'precision-currency-standard':
        break
      case 'precision-currency-cash':
        onUnsupported(precision.style)
        break
      case 'precision-increment':
        onUnsupported(precision.style, String(precision.increment))
        break
    }
  }

  if (notation) {
    switch (notation.style) {
      case 'compact-short':
        opt.notation = 'compact'
        opt.compactDisplay = 'short'
        break
      case 'compact-long':
        opt.notation = 'compact'
        opt.compactDisplay = 'long'
        break
      case 'notation-simple':
        opt.notation = 'standard'
        break
      case 'scientific':
      case 'engineering': {
        const { expDigits, expSign, source, style } = notation
        opt.notation = style
        if (expDigits || expSign) onUnsupported(style, source)
        break
      }
    }
  }

  switch (sign) {
    case 'sign-auto':
      opt.signDisplay = 'auto'
      break
    case 'sign-always':
      opt.signDisplay = 'always'
      break
    case 'sign-except-zero':
      opt.signDisplay = 'exceptZero'
      break
    case 'sign-never':
      opt.signDisplay = 'never'
      break
    case 'sign-accounting':
      opt.currencySign = 'accounting'
      break
    case 'sign-accounting-always':
      opt.currencySign = 'accounting'
      opt.signDisplay = 'always'
      break
    case 'sign-accounting-except-zero':
      opt.currencySign = 'accounting'
      opt.signDisplay = 'exceptZero'
      break
  }

  if (decimal === 'decimal-always') onUnsupported(decimal)
  if (roundingMode) onUnsupported(roundingMode)

  return opt
}
