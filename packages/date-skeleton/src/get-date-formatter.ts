import { getDateFormatOptions, DateFormatError } from './options'
import { parseDateTokens, DateToken } from './tokens'

export function getDateFormatter(
  locales: string | string[],
  tokens: string | DateToken[],
  onError?: (error: DateFormatError) => void
) {
  if (typeof tokens === 'string') tokens = parseDateTokens(tokens)
  const opt = getDateFormatOptions(tokens, onError)
  const dtf = new Intl.DateTimeFormat(locales, opt)
  return (date: Date | number) => dtf.format(date)
}

export function getDateFormatterSource(
  locales: string | string[],
  tokens: string | DateToken[],
  onError?: (err: DateFormatError) => void
) {
  if (typeof tokens === 'string') tokens = parseDateTokens(tokens)
  const opt = getDateFormatOptions(tokens, onError)
  const lines = [
    `(function() {`,
    `var opt = ${JSON.stringify(opt)};`,
    `var dtf = new Intl.DateTimeFormat(${JSON.stringify(locales)}, opt);`,
    `return function(value) { return dtf.format(value); }`
  ]

  return lines.join('\n  ') + '\n})()'
}
