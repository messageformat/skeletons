<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [messageformat-number-skeleton](./messageformat-number-skeleton.md) &gt; [getFormatterSource](./messageformat-number-skeleton.getformattersource.md)

## getFormatterSource() function

Returns a string of JavaScript source that evaluates to a number formatter function with the same `(value: number) => string` signature as the function returned by [getFormatter()](./messageformat-number-skeleton.getformatter.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare function getFormatterSource(locales: string | string[], src: string, onError?: (err: SkeletonError) => void): string;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  locales | <code>string &#124; string[]</code> |  |
|  src | <code>string</code> |  |
|  onError | <code>(err: SkeletonError) =&gt; void</code> |  |

<b>Returns:</b>

`string`

## Remarks

The returned function will memoize an `Intl.NumberFormat` instance. If the error callback is defined, it will be called separately for each encountered parsing error and unsupported feature.

## Example


```js
import { getFormatterSource } from 'messageformat-number-skeleton'

getFormatterSource('en', 'percent', console.error)
// '(function() {\n' +
// '  var opt = {"style":"percent"};\n' +
// '  var nf = new Intl.NumberFormat(["en"], opt);\n' +
// '  return function(value) { return nf.format(0.01 * value); }\n' +
// '})()'

const src = getFormatterSource('en-CA', 'currency/CAD unit-width-narrow', console.error)
// '(function() {\n' +
// '  var opt = {"style":"currency","currency":"CAD","currencyDisplay":"narrowSymbol","unitDisplay":"narrow"};\n' +
// '  var nf = new Intl.NumberFormat(["en-CA"], opt);\n'
// '  return function(value) { return nf.format(value); }\n' +
// '})()'
const fmt = new Function(`return ${src}`)()
fmt(42) // '$42.00'

```
