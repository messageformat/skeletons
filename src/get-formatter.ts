import { UnsupportedError, SkeletonError } from './errors'
import { getNumberFormatLocales } from './nf-locales'
import { getNumberFormatOptions } from './nf-options'
import { parseSkeleton } from './parse'

export function getFormatter(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { errors, skeleton } = parseSkeleton(src)
  if (onError) for (const error of errors) onError(error)
  function handleUnsupported(stem: string, source?: string) {
    if (onError) onError(new UnsupportedError(stem, source))
  }
  const opt = getNumberFormatOptions(skeleton, handleUnsupported)

  const { scale, unit } = skeleton
  const lc = getNumberFormatLocales(locales, skeleton)

  const nf = new Intl.NumberFormat(lc, opt)
  let mult = typeof scale === 'number' && scale > 0 ? scale : 1
  if (unit && unit.style === 'percent') mult *= 0.01
  return (value: number) => nf.format(mult * value)
}
