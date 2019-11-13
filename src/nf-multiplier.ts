import { Skeleton } from './skeleton'

export function getNumberFormatMultiplier({ scale, unit }: Skeleton) {
  if (typeof scale !== 'number' || isNaN(scale) || scale <= 0) scale = 1

  // With ICU NumberFormatter, the `percent` skeleton would style 25 as "25%".
  // To achieve the same with JS Intl.NumberFormat, the input value must be 0.25
  return unit && unit.style === 'percent' ? scale * 0.01 : scale
}
