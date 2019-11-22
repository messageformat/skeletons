import { Skeleton } from '../types/skeleton'
import { parseSkeleton } from './parse-skeleton'

const tests: { [testSet: string]: { [src: string]: Skeleton } } = {
  examples: {
    percent: { unit: { style: 'percent' } },
    '.00': {
      precision: {
        style: 'precision-fraction',
        minFraction: 2,
        maxFraction: 2,
        source: '.00'
      }
    },
    'percent .00': {
      precision: {
        style: 'precision-fraction',
        minFraction: 2,
        maxFraction: 2,
        source: '.00'
      },
      unit: { style: 'percent' }
    },
    'scale/100': { scale: 100 },
    'percent scale/100': { scale: 100, unit: { style: 'percent' } },
    'measure-unit/length-meter': {
      unit: { style: 'measure-unit', unit: 'length-meter' }
    },
    'measure-unit/length-meter unit-width-full-name': {
      unit: { style: 'measure-unit', unit: 'length-meter' },
      unitWidth: 'unit-width-full-name'
    },
    'currency/CAD': { unit: { style: 'currency', currency: 'CAD' } },
    'currency/CAD unit-width-narrow': {
      unit: { style: 'currency', currency: 'CAD' },
      unitWidth: 'unit-width-narrow'
    },
    'compact-short': { notation: { style: 'compact-short' } },
    'compact-long': { notation: { style: 'compact-long' } },
    'compact-short currency/CAD': {
      notation: { style: 'compact-short' },
      unit: { style: 'currency', currency: 'CAD' }
    },
    'group-min2': { group: 'group-min2' },
    'group-off': { group: 'group-off' },
    'sign-always': { sign: 'sign-always' },
    'sign-auto': { sign: 'sign-auto' },
    'sign-except-zero': { sign: 'sign-except-zero' },
    'sign-accounting currency/CAD': {
      sign: 'sign-accounting',
      unit: { style: 'currency', currency: 'CAD' }
    }
  },
  notation: {
    scientific: { notation: { style: 'scientific', source: '' } },
    'scientific/sign-auto': {
      notation: {
        style: 'scientific',
        expSign: 'sign-auto',
        source: 'sign-auto'
      }
    },
    'scientific/+ee': {
      notation: { style: 'scientific', expDigits: 2, source: '+ee' }
    },
    'scientific/+ee/sign-always': {
      notation: {
        style: 'scientific',
        expDigits: 2,
        expSign: 'sign-always',
        source: '+ee/sign-always'
      }
    }
  },
  precision: {
    'precision-increment/0.05': {
      precision: { style: 'precision-increment', increment: 0.05 }
    },
    '.00': {
      precision: {
        style: 'precision-fraction',
        minFraction: 2,
        maxFraction: 2,
        source: '.00'
      }
    },
    '.00+': {
      precision: { style: 'precision-fraction', minFraction: 2, source: '.00+' }
    },
    '.##': {
      precision: {
        style: 'precision-fraction',
        minFraction: 0,
        maxFraction: 2,
        source: '.##'
      }
    },
    '.0#': {
      precision: {
        style: 'precision-fraction',
        minFraction: 1,
        maxFraction: 2,
        source: '.0#'
      }
    },
    '.##/@@@+': {
      precision: {
        style: 'precision-fraction',
        minFraction: 0,
        maxFraction: 2,
        minSignificant: 3,
        source: '.##/@@@+'
      }
    },
    '.00/@##': {
      precision: {
        style: 'precision-fraction',
        minFraction: 2,
        maxFraction: 2,
        minSignificant: 1,
        maxSignificant: 3,
        source: '.00/@##'
      }
    },
    '@@@': {
      precision: {
        style: 'precision-fraction',
        minSignificant: 3,
        maxSignificant: 3,
        source: '@@@'
      }
    },
    '@@@+': {
      precision: {
        style: 'precision-fraction',
        minSignificant: 3,
        source: '@@@+'
      }
    },
    '@##': {
      precision: {
        style: 'precision-fraction',
        minSignificant: 1,
        maxSignificant: 3,
        source: '@##'
      }
    },
    '@@#': {
      precision: {
        style: 'precision-fraction',
        minSignificant: 2,
        maxSignificant: 3,
        source: '@@#'
      }
    }
  },
  'integer-width': {
    'integer-width/+000': { integerWidth: { min: 3, source: '+000' } },
    'integer-width/##0': { integerWidth: { min: 1, max: 3, source: '##0' } },
    'integer-width/00': { integerWidth: { min: 2, max: 2, source: '00' } },
    'integer-width/+': { integerWidth: { min: 0, source: '+' } }
  },
  scale: {
    'scale/100': { scale: 100 },
    'scale/1E2': { scale: 100 },
    'scale/0.5': { scale: 0.5 }
  },
  misc: {
    ' ': {},
    'decimal-always': { decimal: 'decimal-always' },
    'decimal-auto': { decimal: 'decimal-auto' },
    latin: { numberingSystem: 'latn' },
    'numbering-system/thai': { numberingSystem: 'thai' },
    'per-measure-unit/duration-second': { unitPer: 'duration-second' },
    'precision-unlimited': { precision: { style: 'precision-unlimited' } },
    'rounding-mode-ceiling': { roundingMode: 'rounding-mode-ceiling' },
    'rounding-mode-down': { roundingMode: 'rounding-mode-down' },
    'rounding-mode-floor': { roundingMode: 'rounding-mode-floor' },
    'rounding-mode-up': { roundingMode: 'rounding-mode-up' }
  }
}

for (const [testSet, cases] of Object.entries(tests)) {
  describe(testSet, () => {
    for (const [src, expected] of Object.entries(cases)) {
      test(src, () => {
        const onError = jest.fn()
        const skeleton = parseSkeleton(src, onError)
        expect(onError).not.toHaveBeenCalled()
        expect(skeleton).toEqual(expected)
      })
    }
  })
}

describe('errors', () => {
  const cases: { [src: string]: {} } = {
    '/': { code: 'BAD_STEM', stem: '' },
    foo: { code: 'BAD_STEM', stem: 'foo' },
    currency: { code: 'MISSING_OPTION', stem: 'currency' },
    'currency/EUR/CAD': { code: 'TOO_MANY_OPTIONS', stem: 'currency' },
    '.00/@@/@@': { code: 'TOO_MANY_OPTIONS', stem: '.00' },
    '@@/.00': { code: 'BAD_OPTION', stem: '@@' },
    'notation-simple/foo': { code: 'BAD_OPTION', stem: 'notation-simple' },
    'scientific engineering': {
      code: 'MASKED_VALUE',
      type: 'notation',
      prev: { style: 'scientific' }
    }
  }
  for (const stem of [
    'currency',
    'engineering',
    'integer-width',
    'measure-unit',
    'numbering-system',
    'per-measure-unit',
    'precision-increment',
    'scale',
    '.00'
  ])
    cases[`${stem}/foo`] = { code: 'BAD_OPTION', stem, option: 'foo' }

  for (const [src, expected] of Object.entries(cases)) {
    test(src, () => {
      const onError = jest.fn()
      parseSkeleton(src, onError)
      expect(onError.mock.calls).toMatchObject([[expected]])
    })
  }
})
