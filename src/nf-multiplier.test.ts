import { getNumberFormatMultiplier } from './nf-multiplier'

test('empty skeleton', () => {
  const n = getNumberFormatMultiplier({})
  expect(n).toBe(1)
})

test('scale', () => {
  const scale = Math.random()
  const n = getNumberFormatMultiplier({ scale })
  expect(n).toBe(scale)
})

test('percent', () => {
  const n = getNumberFormatMultiplier({ unit: { style: 'percent' } })
  expect(n).toBe(0.01)
})

test('percent scale/1000', () => {
  const n = getNumberFormatMultiplier({
    scale: 1000,
    unit: { style: 'percent' }
  })
  expect(n).toBe(10)
})
