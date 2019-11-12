# messageformat-number-skeleton

Tools for working with [ICU NumberFormatter skeletons](https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md).

## parseSkeleton(src: string): { errors: Error[], skeleton: Skeleton }

Parse an input skeleton string into a regular structure; see [`skeleton.d.ts`](skeleton.d.ts) for its structure. Should never throw, collecting instead errors into an array.

```js
import { parseSkeleton } from "messageformat-number-skeleton/parse";

const src = "compact-short currency/GBP";
const { errors, skeleton } = parseSkeleton(src);
// errors: []
// skeleton: {
//   notation: { style: 'compact-short' },
//   unit: { style: 'currency', currency: 'GBP' }
// }
```

## getNumberFormatOptions(skeleton: Skeleton, onUnsupported: Function): Intl.NumberFormatOptions

Given an input ICU NumberFormatter skeleton, does its best to construct a corresponding `Intl.NumberFormat` options structure. In addition to standard options, some features make use of the currently Stage 3 [Intl.NumberFormat Unified API Proposal](https://github.com/tc39/proposal-unified-intl-numberformat), which have limited support. If encountering unsupported features (e.g. `decimal-always`, `permille`, others), the callback will be called with the arguments `(stem: string, source?: string)`, where `source` may specify the source of an unsupported option.

```js
import { getNumberFormatOptions } from "messageformat-number-skeleton/nf-options";
import { parseSkeleton } from "messageformat-number-skeleton/parse";

const logUnsupported = (stem, src) =>
  console.log("Unsupported:", stem, src || "");

const src = "currency/CAD unit-width-narrow";
const { errors, skeleton } = parseSkeleton(src);
// errors: []
// skeleton: {
//   unit: { style: 'currency', currency: 'CAD' },
//   unitWidth: 'unit-width-narrow'
// }

getNumberFormatOptions(skeleton, logUnsupported);
// {
//   style: 'currency',
//   currency: 'CAD',
//   currencyDisplay: 'narrowSymbol',
//   unitDisplay: 'narrow'
// }

const { skeleton: sk2 } = parseSkeleton("group-min2");
// { group: 'group-min2' }

getNumberFormatOptions(sk2, logUnsupported);
// Unsupported: group-min2
// {}
```

## getFormatter(locales: string | string[], src: string, onError?: Function): Function

Returns a number formatter function `(value: number) => string` for the given locales and skeleton source. Uses `Intl.NumberFormat` internally. If the error callback `(error: Error) => void` is defined, it will be called separately for each encountered parsing error and unsupported feature.

```js
import { getFormatter } from "messageformat-number-skeleton/get-formatter";

let src = "currency/CAD unit-width-narrow";
let fmt = getFormatter("en-CA", src, console.error);
fmt(42); // '$42.00'

src = "percent scale/100";
fmt = getFormatter("en", src, console.error);
fmt(0.3); // '30%'
```

---

[Messageformat](https://messageformat.github.io/) is an OpenJS Foundation project, and we follow its [Code of Conduct](https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md).

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>
```
