import { Skeleton } from "./skeleton";

// Extends options to include features brought by the Stage 3 Intl.NumberFormat
// Unified API Proposal: https://github.com/tc39/proposal-unified-intl-numberformat
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  compactDisplay?: "long" | "short";
  currencySign?: "standard" | "accounting";
  notation?: "standard" | "engineering" | "scientific" | "compact";
  signDisplay?: "auto" | "always" | "never" | "exceptZero";
  unit?: string;
  unitDisplay?: "long" | "short" | "narrow";
}

export function getNumberFormatOptions(
  {
    decimal,
    group,
    integerWidth,
    notation,
    precision,
    roundingMode,
    sign,
    unit,
    unitPer,
    unitWidth
  }: Skeleton,
  unsupported: (stem: string, source?: string) => void
) {
  const opt: NumberFormatOptions = {};

  if (unit) {
    switch (unit.style) {
      case "base-unit":
        opt.style = "decimal";
        break;
      case "currency":
        opt.style = "currency";
        opt.currency = unit.currency;
        break;
      case "measure-unit":
        opt.style = "unit";
        opt.unit = unit.unit.replace(/.*-/, "");
        if (unitPer) opt.unit += "-per-" + unitPer.replace(/.*-/, "");
        break;
      case "percent":
        opt.style = "percent";
        break;
      case "permille":
        unsupported("permille");
        break;
    }
  }

  switch (unitWidth) {
    case "unit-width-full-name":
      opt.currencyDisplay = "name";
      opt.unitDisplay = "long";
      break;
    case "unit-width-hidden":
      unsupported(unitWidth);
      break;
    case "unit-width-iso-code":
      opt.currencyDisplay = "code";
      break;
    case "unit-width-narrow":
      opt.currencyDisplay = "narrowSymbol";
      opt.unitDisplay = "narrow";
      break;
    case "unit-width-short":
      opt.currencyDisplay = "symbol";
      opt.unitDisplay = "short";
      break;
  }

  switch (group) {
    case "group-auto":
      opt.useGrouping = true;
      break;
    case "group-off":
      opt.useGrouping = false;
      break;
    case "group-min2":
    case "group-on-aligned":
    case "group-thousands":
      unsupported(group);
      break;
  }

  if (integerWidth) {
    const { min, max, source } = integerWidth;
    if (min > 0) opt.minimumIntegerDigits = min;
    if (Number(max) > 0) unsupported("integer-width", source);
  }

  if (precision) {
    switch (precision.style) {
      case "precision-fraction": {
        const {
          minFraction: minF,
          maxFraction: maxF,
          minSignificant: minS,
          maxSignificant: maxS,
          source
        } = precision;
        if (typeof minF === "number") {
          opt.minimumFractionDigits = minF;
          if (typeof minS === "number")
            unsupported("precision-fraction", source);
        }
        if (typeof maxF === "number") opt.maximumFractionDigits = maxF;
        if (typeof minS === "number") opt.minimumSignificantDigits = minS;
        if (typeof maxS === "number") opt.maximumSignificantDigits = maxS;
        break;
      }
      case "precision-integer":
        opt.maximumFractionDigits = 0;
        break;
      case "precision-unlimited":
        opt.maximumFractionDigits = 20;
        break;
      case "precision-currency-standard":
        break;
      case "precision-currency-cash":
        unsupported(precision.style);
        break;
      case "precision-increment":
        unsupported(precision.style, String(precision.increment));
        break;
    }
  }

  if (notation) {
    switch (notation.style) {
      case "compact-short":
        opt.notation = "compact";
        opt.compactDisplay = "short";
        break;
      case "compact-long":
        opt.notation = "compact";
        opt.compactDisplay = "long";
        break;
      case "notation-simple":
        opt.notation = "standard";
        break;
      case "scientific":
      case "engineering": {
        const { expDigits, expSign, source, style } = notation;
        opt.notation = style;
        if (expDigits || expSign) unsupported(style, source);
        break;
      }
    }
  }

  switch (sign) {
    case "sign-auto":
      opt.signDisplay = "auto";
      break;
    case "sign-always":
      opt.signDisplay = "always";
      break;
    case "sign-except-zero":
      opt.signDisplay = "exceptZero";
      break;
    case "sign-never":
      opt.signDisplay = "never";
      break;
    case "sign-accounting":
      opt.currencySign = "accounting";
      break;
    case "sign-accounting-always":
      opt.currencySign = "accounting";
      opt.signDisplay = "always";
      break;
    case "sign-accounting-except-zero":
      opt.currencySign = "accounting";
      opt.signDisplay = "exceptZero";
      break;
  }

  if (decimal === "decimal-always") unsupported(decimal);
  if (roundingMode) unsupported(roundingMode);

  return opt;
}
