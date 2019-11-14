import {
  SkeletonError,
  BadOptionError,
  BadStemError,
  MaskedValueError,
  TooManyOptionsError
} from '../errors'
import { isNumberingSystem, Skeleton } from '../types/skeleton'
import { isUnit } from '../types/unit'
import { validOptions } from './options'

function parseBlueprintDigits(src: string, style: 'fraction' | 'significant') {
  const re = style === 'fraction' ? /^\.(0*)(\+|#*)$/ : /^(@+)(\+|#*)$/
  const match = src && src.match(re)
  if (match) {
    const min = match[1].length
    switch (match[2].charAt(0)) {
      case '':
        return { min, max: min }
      case '+':
        return { min, max: null }
      case '#': {
        return { min, max: min + match[2].length }
      }
    }
  }
  return null
}

class Parser {
  onError: (err: SkeletonError) => void
  skeleton: Skeleton = {}

  constructor(onError?: (err: SkeletonError) => void) {
    this.onError = onError || (() => {})
  }

  badOption(stem: string, opt: string) {
    this.onError(new BadOptionError(stem, opt))
  }

  assertEmpty(key: keyof Skeleton) {
    const prev = this.skeleton[key]
    if (prev) this.onError(new MaskedValueError(key, prev))
  }

  parseBlueprints(stem: string, options: string[]) {
    const option = options[0]
    const res = this.skeleton

    const fd = parseBlueprintDigits(stem, 'fraction')
    if (fd) {
      if (options.length > 1)
        this.onError(new TooManyOptionsError(stem, options, 1))
      this.assertEmpty('precision')
      res.precision = {
        style: 'precision-fraction',
        source: stem,
        minFraction: fd.min
      }
      if (fd.max != null) res.precision.maxFraction = fd.max
      const sd = parseBlueprintDigits(option, 'significant')
      if (sd) {
        res.precision.source = `${stem}/${option}`
        res.precision.minSignificant = sd.min
        if (sd.max != null) res.precision.maxSignificant = sd.max
      } else if (option) this.badOption(stem, option)
      return
    }

    const sd = parseBlueprintDigits(stem, 'significant')
    if (sd) {
      for (const opt of options) this.badOption(stem, opt)
      this.assertEmpty('precision')
      res.precision = {
        style: 'precision-fraction',
        source: stem,
        minSignificant: sd.min
      }
      if (sd.max != null) res.precision.maxSignificant = sd.max
      return
    }

    this.onError(new BadStemError(stem))
  }

  parseToken(stem: string, options: string[]) {
    if (!validOptions(stem, options, this.onError)) return

    const option = options[0]
    const res = this.skeleton

    switch (stem) {
      // notation
      case 'compact-short':
      case 'compact-long':
      case 'notation-simple':
        this.assertEmpty('notation')
        res.notation = { style: stem }
        break
      case 'scientific':
      case 'engineering': {
        let expDigits = null
        let expSign: Skeleton['sign'] = undefined
        for (const opt of options) {
          switch (opt) {
            case 'sign-auto':
            case 'sign-always':
            case 'sign-never':
            case 'sign-accounting':
            case 'sign-accounting-always':
            case 'sign-except-zero':
            case 'sign-accounting-except-zero':
              expSign = opt
              break
            default:
              if (/^\+e+$/.test(opt)) expDigits = opt.length - 1
              else {
                this.badOption(stem, opt)
              }
          }
        }
        this.assertEmpty('notation')
        const source = options.join('/')
        res.notation =
          expDigits && expSign
            ? { style: stem, source, expDigits, expSign }
            : expDigits
            ? { style: stem, source, expDigits }
            : expSign
            ? { style: stem, source, expSign }
            : { style: stem, source }
        break
      }

      // unit
      case 'percent':
      case 'permille':
      case 'base-unit':
        this.assertEmpty('unit')
        res.unit = { style: stem }
        break
      case 'currency':
        if (/^[A-Z]{3}$/.test(option)) {
          this.assertEmpty('unit')
          res.unit = { style: stem, currency: option }
        } else this.badOption(stem, option)
        break
      case 'measure-unit': {
        if (isUnit(option)) {
          this.assertEmpty('unit')
          res.unit = { style: stem, unit: option }
        } else this.badOption(stem, option)
        break
      }

      // unitPer
      case 'per-measure-unit': {
        if (isUnit(option)) {
          this.assertEmpty('unitPer')
          res.unitPer = option
        } else this.badOption(stem, option)
        break
      }

      // unitWidth
      case 'unit-width-narrow':
      case 'unit-width-short':
      case 'unit-width-full-name':
      case 'unit-width-iso-code':
      case 'unit-width-hidden':
        this.assertEmpty('unitWidth')
        res.unitWidth = stem
        break

      // precision
      case 'precision-integer':
      case 'precision-unlimited':
      case 'precision-currency-standard':
      case 'precision-currency-cash':
        this.assertEmpty('precision')
        res.precision = { style: stem }
        break
      case 'precision-increment': {
        const increment = Number(option)
        if (increment > 0) {
          this.assertEmpty('precision')
          res.precision = { style: stem, increment }
        } else this.badOption(stem, option)
        break
      }

      // roundingMode
      case 'rounding-mode-ceiling':
      case 'rounding-mode-floor':
      case 'rounding-mode-down':
      case 'rounding-mode-up':
      case 'rounding-mode-half-even':
      case 'rounding-mode-half-down':
      case 'rounding-mode-half-up':
      case 'rounding-mode-unnecessary':
        this.assertEmpty('roundingMode')
        res.roundingMode = stem
        break

      // integerWidth
      case 'integer-width': {
        if (/^\+0*$/.test(option)) {
          this.assertEmpty('integerWidth')
          res.integerWidth = { source: option, min: option.length - 1 }
        } else {
          const m = option.match(/^#*(0*)$/)
          if (m) {
            this.assertEmpty('integerWidth')
            res.integerWidth = {
              source: option,
              min: m[1].length,
              max: m[0].length
            }
          } else this.badOption(stem, option)
        }
        break
      }

      // scale
      case 'scale': {
        const scale = Number(option)
        if (scale > 0) {
          this.assertEmpty('scale')
          res.scale = scale
        } else this.badOption(stem, option)
        break
      }

      // group
      case 'group-off':
      case 'group-min2':
      case 'group-auto':
      case 'group-on-aligned':
      case 'group-thousands':
        this.assertEmpty('group')
        res.group = stem
        break

      // numberingSystem
      case 'latin':
        this.assertEmpty('numberingSystem')
        res.numberingSystem = 'latn'
        break
      case 'numbering-system': {
        if (isNumberingSystem(option)) {
          this.assertEmpty('numberingSystem')
          res.numberingSystem = option
        } else this.badOption(stem, option)
        break
      }

      // sign
      case 'sign-auto':
      case 'sign-always':
      case 'sign-never':
      case 'sign-accounting':
      case 'sign-accounting-always':
      case 'sign-except-zero':
      case 'sign-accounting-except-zero':
        this.assertEmpty('sign')
        res.sign = stem
        break

      // decimal
      case 'decimal-auto':
      case 'decimal-always':
        this.assertEmpty('decimal')
        res.decimal = stem
        break

      // precision blueprints
      default:
        this.parseBlueprints(stem, options)
    }
  }
}

function readTokens(src: string) {
  const tokens = []
  for (const part of src.split(' ')) {
    if (part) {
      const options = part.split('/')
      const stem = options.shift() || ''
      tokens.push({ stem, options })
    }
  }
  return tokens
}

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
) {
  const parser = new Parser(onError)
  for (const { stem, options } of readTokens(src)) {
    parser.parseToken(stem, options)
  }
  return parser.skeleton
}
