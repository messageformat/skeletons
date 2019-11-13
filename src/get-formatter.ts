import { UnsupportedError, SkeletonError } from './errors'
import { getNumberFormatLocales } from './nf-locales'
import { getNumberFormatMultiplier } from './nf-multiplier'
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
  const lc = getNumberFormatLocales(locales, skeleton)
  const mult = getNumberFormatMultiplier(skeleton)
  const nf = new Intl.NumberFormat(lc, opt)
  return (value: number) => nf.format(mult * value)
}
