<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [messageformat-number-skeleton](./messageformat-number-skeleton.md) &gt; [getFormatter](./messageformat-number-skeleton.getformatter.md)

## getFormatter() function

Returns a number formatter function for the given locales and skeleton source.

<b>Signature:</b>

```typescript
export declare function getFormatter(locales: string | string[], src: string, onError?: (err: SkeletonError) => void): (value: number) => string;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  locales | <code>string &#124; string[]</code> |  |
|  src | <code>string</code> |  |
|  onError | <code>(err: SkeletonError) =&gt; void</code> |  |

<b>Returns:</b>

`(value: number) => string`

## Remarks

Uses `Intl.NumberFormat` internally. If the error callback is defined, it will be called separately for each encountered parsing error and unsupported feature.

## Example


```js
import { getFormatter } from 'messageformat-number-skeleton'

let src = 'currency/CAD unit-width-narrow'
let fmt = getFormatter('en-CA', src, console.error)
fmt(42) // '$42.00'

src = 'percent scale/100'
fmt = getFormatter('en', src, console.error)
fmt(0.3) // '30%'

```
