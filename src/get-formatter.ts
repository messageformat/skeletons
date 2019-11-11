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
  function handleUnsupported(stem: string, value?: string) {
    if (onError) onError(new UnsupportedError(stem, value));
  }
  const opt = getNumberFormatOptions(skeleton, handleUnsupported);

  const { numberingSystem, scale } = skeleton;
  if (numberingSystem) {
    const nu = (lc: string) => `${lc}-u-nu-${numberingSystem}`;
    if (Array.isArray(locales)) {
      locales = locales.map(nu).concat(locales);
    } else locales = [nu(locales), locales];
  }

  const nf = new Intl.NumberFormat(locales, opt);
  const mult = typeof scale === "number" && scale > 0 ? scale : 1;
  return (value: number) => nf.format(mult * value);
}
