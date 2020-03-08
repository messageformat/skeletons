# messageformat-number-skeleton

Tools for working with [ICU NumberFormatter skeletons](https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md)<!-- -->.

```js
import {
 getNumberFormatter,
 getNumberFormatterSource,
 NumberFormatError,
 parseNumberPattern,
 parseNumberSkeleton,
 Skeleton,
 Unit
} from 'messageformat-number-skeleton'

```

## Classes

|  Class | Description |
|  --- | --- |
|  [NumberFormatError](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.numberformaterror.md) | Base class for errors. In addition to a <code>code</code> and a human-friendly <code>message</code>, may also includes the token <code>stem</code> as well as other fields. |

## Functions

|  Function | Description |
|  --- | --- |
|  [getNumberFormatter(locales, skeleton, currency, onError)](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.getnumberformatter.md) | Returns a number formatter function for the given locales and number skeleton |
|  [getNumberFormatterSource(locales, skeleton, currency, onError)](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.getnumberformattersource.md) | Returns a string of JavaScript source that evaluates to a number formatter function with the same <code>(value: number) =&gt; string</code> signature as the function returned by [getNumberFormatter()](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.getnumberformatter.md)<!-- -->. |
|  [parseNumberPattern(src, currency, onError)](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.parsenumberpattern.md) | Parse an [ICU NumberFormatter pattern](http://unicode.org/reports/tr35/tr35-numbers.html#Number_Format_Patterns) string into a [Skeleton](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.skeleton.md) structure. |
|  [parseNumberSkeleton(src, onError)](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.parsenumberskeleton.md) | Parse an [ICU NumberFormatter skeleton](https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md) string into a [Skeleton](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.skeleton.md) structure. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [Skeleton](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.skeleton.md) | An object representation of a parsed string skeleton, with token values grouped by type. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [Unit](https://github.com/messageformat/skeletons/blob/master/packages/number-skeleton/docs/messageformat-number-skeleton.unit.md) | Measurement units defined by the [Unicode CLDR](https://github.com/unicode-org/cldr/blob/d4d77a2/common/validity/unit.xml) |

---

[Messageformat](https://messageformat.github.io/) is an OpenJS Foundation project, and we follow its [Code of Conduct](https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md).

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>