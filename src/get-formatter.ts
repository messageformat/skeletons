import { UnsupportedError, SkeletonError } from './errors'
import { getNumberFormatLocales } from './nf-locales'
import { getNumberFormatMultiplier } from './nf-multiplier'
import { getNumberFormatOptions } from './nf-options'
import { parseSkeleton } from './parse'

function getNumberFormatVariables(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { errors, skeleton } = parseSkeleton(src)
  if (onError) for (const error of errors) onError(error)
  function handleUnsupported(stem: string, source?: string) {
    if (onError) onError(new UnsupportedError(stem, source))
  }
  const lc = getNumberFormatLocales(locales, skeleton)
  const opt = getNumberFormatOptions(skeleton, handleUnsupported)
  const mult = getNumberFormatMultiplier(skeleton)
  return { lc, opt, mult }
}

export function getFormatter(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { lc, opt, mult } = getNumberFormatVariables(locales, src, onError)
  const nf = new Intl.NumberFormat(lc, opt)
  return (value: number) => nf.format(mult * value)
}

export function getFormatterSource(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { lc, opt, mult } = getNumberFormatVariables(locales, src, onError)
  const source = `
(function() {
  var nf = new Intl.NumberFormat(${JSON.stringify(lc)}, ${JSON.stringify(opt)});
  return function(value) { return nf.format(${JSON.stringify(mult)} * value); }
})()`
  return source.trim()
}
