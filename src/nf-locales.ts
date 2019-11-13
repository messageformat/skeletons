import { Skeleton } from './skeleton'

// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
export function getNumberFormatLocales(
  locales: string | string[],
  { numberingSystem }: Skeleton
) {
  if (!Array.isArray(locales)) locales = [locales]
  return numberingSystem
    ? locales
        .map(lc => {
          const ext = lc.indexOf('-u-') === -1 ? 'u-nu' : 'nu'
          return `${lc}-${ext}-${numberingSystem}`
        })
        .concat(locales)
    : locales
}
