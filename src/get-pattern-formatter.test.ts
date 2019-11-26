import { getFormatter, getFormatterSource } from './get-formatter'
import { parsePattern } from './parse-pattern'

const tests: {
  [testSet: string]: {
    [src: string]: {
      value: number
      lc: string
      cur?: string
      exp: string
    }
  }
} = {
  'Number Patterns': {
    '#,##0.##': { value: 1234.567, lc: 'fr', exp: '1 234,57' },
    '#,##0.###': { value: 1234.567, lc: 'fr', exp: '1 234,567' },
    '###0.#####': { value: 1234.567, lc: 'fr', exp: '1234,567' },
    '###0.0000#': { value: 1234.567, lc: 'fr', exp: '1234,5670' },
    '00000.0000': { value: 1234.567, lc: 'fr', exp: '01234,5670' },
    '#,##0.00 ¤': { value: 1234.567, lc: 'fr', cur: 'EUR', exp: '1 234,57 €' },
    '##,##0.00 ¤': {
      value: 1234.567,
      lc: 'fr',
      cur: 'JPY',
      exp: '1 234,57 JPY'
    }
    //"'#'#": { value: 123, lc: 'en', exp: '#123' },
    //"# o''clock": { value: 12, lc: 'en', exp: "12 o'clock" }
  },
  'Currency symbol': {
    '¤': { value: 12, lc: 'en', cur: 'CAD', exp: 'CA$12.00' },
    '¤¤': { value: 12, lc: 'en', cur: 'CAD', exp: 'CAD 12.00' },
    '¤¤¤': { value: 5, lc: 'en', cur: 'CAD', exp: '5.00 Canadian dollars' },
    '¤¤¤¤¤': { value: 12, lc: 'en', cur: 'CAD', exp: '$12.00' }
  },
  //'Scientific Notation': {
  //  '0.###E0': { value: 1234, lc: 'en', exp: '1.234E3' },
  //  '0.###E+0': { value: 1, lc: 'en', exp: '1E+0' },
  //  '00.###E0': { value: 0.00123, lc: 'en', exp: '12.3E-4' },
  //  '##0.####E0': { value: 12345, lc: 'en', exp: '12.345E3' }
  //},
  'Significant Digits': {
    '@@': { value: 12345, lc: 'en', exp: '12,000' },
    '@@@': { value: 0.12345, lc: 'en', exp: '0.123' },
    '@@##': { value: 3.14159, lc: 'en', exp: '3.142' },
    '@@###': { value: 1.23004, lc: 'en', exp: '1.23' },
    '@##': { value: 0.1203, lc: 'en', exp: '0.12' },
    '#,#@#': { value: 1234, lc: 'en', exp: '1,200' }
    //'@@###E0': { value: 1234, lc: 'en', exp: '1.234E3' }
  },
  Rounding: {
    '#,#50': { value: 1230, lc: 'en', exp: '1,250' },
    '#,##0.65': { value: 1.234, lc: 'en', exp: '1.3' }
  }
}

for (const [testSet, cases] of Object.entries(tests)) {
  describe(testSet, () => {
    for (const [src, { value, lc, cur: cur, exp }] of Object.entries(cases)) {
      test(src, () => {
        const cb = jest.fn()

        // function from string
        let fmt = getFormatter(lc, src, cur, cb)
        expect(cb).not.toHaveBeenCalled()
        expect(fmt(value)).toBe(exp)

        // function from skeleton
        const skeleton = parsePattern(src, cur)
        fmt = getFormatter([lc], skeleton)
        expect(fmt(value)).toBe(exp)

        // source from string
        let fmtSrc = getFormatterSource(lc, src, cur)
        fmt = new Function(`return ${fmtSrc}`)()
        expect(fmt(value)).toBe(exp)

        // source from skeleton
        fmtSrc = getFormatterSource([lc], skeleton, cur)
        fmt = new Function(`return ${fmtSrc}`)()
        expect(fmt(value)).toBe(exp)
      })
    }
  })
}
