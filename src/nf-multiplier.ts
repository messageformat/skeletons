import { Skeleton } from './skeleton'

/**
 * Determine a multiplier for the input value to account for any `scale` and
 * `percent` tokens in the skeleton.
 *
 * @public
 * @remarks
 * With ICU NumberFormatter, the `percent` skeleton would style `25` as "25%".
 * To achieve the same with `Intl.NumberFormat`, the input value must be `0.25`.
 */
export function getNumberFormatMultiplier({ scale, unit }: Skeleton) {
  if (typeof scale !== 'number' || isNaN(scale) || scale <= 0) scale = 1
  return unit && unit.style === 'percent' ? scale * 0.01 : scale
}
