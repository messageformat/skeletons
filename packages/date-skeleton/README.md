# messageformat-date-skeleton

Tools for working with [ICU DateFormat skeletons](http://userguide.icu-project.org/formatparse/datetime)<!-- -->.

```js
import {
  DateFormatError,
  DateToken,
  getDateFormatter,
  getDateFormatterSource,
  parseDateTokens
} from 'messageformat-date-skeleton'

```

## Classes

|  Class | Description |
|  --- | --- |
|  [DateFormatError](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.dateformaterror.md) | Parent class for errors. |

## Functions

|  Function | Description |
|  --- | --- |
|  [getDateFormatter(locales, tokens, onError)](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.getdateformatter.md) | Returns a date formatter function for the given locales and date skeleton |
|  [getDateFormatterSource(locales, tokens, onError)](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.getdateformattersource.md) | Returns a string of JavaScript source that evaluates to a date formatter function with the same <code>(value: number) =&gt; string</code> signature as the function returned by [getDateFormatter()](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.getdateformatter.md)<!-- -->. |
|  [parseDateTokens(src)](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.parsedatetokens.md) | Parse an [ICU DateFormat skeleton](http://userguide.icu-project.org/formatparse/datetime) string into a [DateToken](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.datetoken.md) array. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [DateToken](https://github.com/messageformat/skeletons/blob/master/packages/date-skeleton/docs/messageformat-date-skeleton.datetoken.md) | An object representation of a parsed date skeleton token |

---

[Messageformat](https://messageformat.github.io/) is an OpenJS Foundation project, and we follow its [Code of Conduct](https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md).

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>