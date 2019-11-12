import { UnsupportedError, SkeletonError } from "./errors";
import { parseSkeleton } from "./parse";
import { getNumberFormatOptions } from "./nf-options";

export function getFormatter(
  locales: string | string[],
  src: string,
  onError?: (err: SkeletonError) => void
) {
  const { errors, skeleton } = parseSkeleton(src);
  if (onError) for (const error of errors) onError(error);
  function handleUnsupported(stem: string, source?: string) {
    if (onError) onError(new UnsupportedError(stem, source));
  }
  const opt = getNumberFormatOptions(skeleton, handleUnsupported);

  const { numberingSystem, scale, unit } = skeleton;
  if (numberingSystem) {
    const nu = (lc: string) => `${lc}-u-nu-${numberingSystem}`;
    if (Array.isArray(locales)) {
      locales = locales.map(nu).concat(locales);
    } else locales = [nu(locales), locales];
  }

  const nf = new Intl.NumberFormat(locales, opt);
  let mult = typeof scale === "number" && scale > 0 ? scale : 1;
  if (unit && unit.style === "percent") mult *= 0.01;
  return (value: number) => nf.format(mult * value);
}
