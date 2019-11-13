import { NumberingSystem, Sign, Skeleton, Unit } from './skeleton'

import {
  SkeletonError,
  BadOptionError,
  BadStemError,
  MaskedValueError,
  MissingOptionError,
  TooManyOptionsError
} from './errors'

const maxOptions = {
  'compact-short': 0,
  'compact-long': 0,
  'notation-simple': 0,
  scientific: 2,
  engineering: 2,
  percent: 0,
  permille: 0,
  'base-unit': 0,
  currency: 1,
  'measure-unit': 1,
  'per-measure-unit': 1,
  'unit-width-narrow': 0,
  'unit-width-short': 0,
  'unit-width-full-name': 0,
  'unit-width-iso-code': 0,
  'unit-width-hidden': 0,
  'precision-integer': 0,
  'precision-unlimited': 0,
  'precision-currency-standard': 0,
  'precision-currency-cash': 0,
  'precision-increment': 1,
  'rounding-mode-ceiling': 0,
  'rounding-mode-floor': 0,
  'rounding-mode-down': 0,
  'rounding-mode-up': 0,
  'rounding-mode-half-even': 0,
  'rounding-mode-half-down': 0,
  'rounding-mode-half-up': 0,
  'rounding-mode-unnecessary': 0,
  'integer-width': 1,
  scale: 1,
  'group-off': 0,
  'group-min2': 0,
  'group-auto': 0,
  'group-on-aligned': 0,
  'group-thousands': 0,
  latin: 0,
  'numbering-system': 1,
  'sign-auto': 0,
  'sign-always': 0,
  'sign-never': 0,
  'sign-accounting': 0,
  'sign-accounting-always': 0,
  'sign-except-zero': 0,
  'sign-accounting-except-zero': 0,
  'decimal-auto': 0,
  'decimal-always': 0
}

const minOptions = {
  currency: 1,
  'integer-width': 1,
  'measure-unit': 1,
  'numbering-system': 1,
  'per-measure-unit': 1,
  'precision-increment': 1,
  scale: 1
}

function hasMaxOption(stem: string): stem is keyof typeof maxOptions {
  return stem in maxOptions
}

function hasMinOption(stem: string): stem is keyof typeof minOptions {
  return stem in minOptions
}

function isNumberingSystem(ns: string): ns is NumberingSystem {
  const systems = [
    'arab',
    'arabext',
    'bali',
    'beng',
    'deva',
    'fullwide',
    'gujr',
    'guru',
    'hanidec',
    'khmr',
    'knda',
    'laoo',
    'latn',
    'limb',
    'mlym',
    'mong',
    'mymr',
    'orya',
    'tamldec',
    'telu',
    'thai',
    'tibt'
  ]
  return systems.indexOf(ns) !== -1
}

// FIXME: subtype is not checked
function isUnit(unit: string): unit is Unit {
  const types = [
    'acceleration',
    'angle',
    'area',
    'concentr',
    'consumption',
    'digital',
    'duration',
    'electric',
    'energy',
    'force',
    'frequency',
    'graphics',
    'length',
    'light',
    'mass',
    'power',
    'pressure',
    'speed',
    'temperature',
    'torque',
    'volume'
  ]
  const [type] = unit.split('-', 1)
  return types.indexOf(type) !== -1
}

function parseDigits(src: string, style: 'fraction' | 'significant') {
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
  errors: SkeletonError[] = []
  skeleton: Skeleton = {}

  badOption(stem: string, opt: string) {
    this.errors.push(new BadOptionError(stem, opt))
  }

  assertEmpty(key: keyof Skeleton) {
    const prev = this.skeleton[key]
    if (prev) this.errors.push(new MaskedValueError(key, prev))
  }

  parseBlueprints(stem: string, options: string[]) {
    const option = options[0]
    const res = this.skeleton

    const fd = parseDigits(stem, 'fraction')
    if (fd) {
      if (options.length > 1)
        this.errors.push(new TooManyOptionsError(stem, options, 1))
      this.assertEmpty('precision')
      res.precision = {
        style: 'precision-fraction',
        source: stem,
        minFraction: fd.min
      }
      if (fd.max != null) res.precision.maxFraction = fd.max
      const sd = parseDigits(option, 'significant')
      if (sd) {
        res.precision.source = `${stem}/${option}`
        res.precision.minSignificant = sd.min
        if (sd.max != null) res.precision.maxSignificant = sd.max
      } else if (option) this.badOption(stem, option)
      return
    }

    const sd = parseDigits(stem, 'significant')
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

    this.errors.push(new BadStemError(stem))
  }

  parseToken(stem: string, options: string[]) {
    const option = options[0]
    const res = this.skeleton
    if (hasMaxOption(stem)) {
      const maxOpt = maxOptions[stem]
      if (options.length > maxOpt) {
        if (maxOpt === 0) for (const opt of options) this.badOption(stem, opt)
        else {
          this.errors.push(new TooManyOptionsError(stem, options, maxOpt))
          return
        }
      } else if (hasMinOption(stem) && options.length < minOptions[stem]) {
        this.errors.push(new MissingOptionError(stem))
        return
      }
    }

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
        let expSign: Sign | null = null
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

  get result() {
    return { errors: this.errors, skeleton: this.skeleton }
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

export function parseSkeleton(src: string) {
  const parser = new Parser()
  for (const { stem, options } of readTokens(src)) {
    parser.parseToken(stem, options)
  }
  return parser.result
}
