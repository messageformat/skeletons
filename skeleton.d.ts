export type Sign =
  | "sign-auto"
  | "sign-always"
  | "sign-never"
  | "sign-accounting"
  | "sign-accounting-always"
  | "sign-except-zero"
  | "sign-accounting-except-zero";

export interface Skeleton {
  decimal: "decimal-auto" | "decimal-always" | null;
  group:
    | "group-off"
    | "group-min2"
    | "group-auto"
    | "group-on-aligned"
    | "group-thousands"
    | null;
  integerWidth: { min: number; max?: number; source: string } | null;
  notation:
    | { style: "compact-short" | "compact-long" | "notation-simple" }
    | {
        style: "scientific" | "engineering";
        expDigits: number | null;
        expSign: Sign | null;
        source: string;
      }
    | null;
  numberingSystem: string | null;
  precision:
    | {
        style:
          | "precision-integer"
          | "precision-unlimited"
          | "precision-currency-standard"
          | "precision-currency-cash";
      }
    | { style: "precision-increment"; increment: number }
    | {
        style: "precision-fraction";
        minFraction?: number;
        maxFraction?: number;
        minSignificant?: number;
        maxSignificant?: number;
        source: string;
      }
    | null;
  roundingMode:
    | "rounding-mode-ceiling"
    | "rounding-mode-floor"
    | "rounding-mode-down"
    | "rounding-mode-up"
    | "rounding-mode-half-even"
    | "rounding-mode-half-down"
    | "rounding-mode-half-up"
    | "rounding-mode-unnecessary"
    | null;
  scale: number | null;
  sign: Sign | null;
  unit:
    | { style: "percent" | "permille" | "base-unit" }
    | { style: "currency"; currency: string }
    | { style: "measure-unit"; unit: string }
    | null;
  unitPer: string | null;
  unitWidth:
    | "unit-width-narrow"
    | "unit-width-short"
    | "unit-width-full-name"
    | "unit-width-iso-code"
    | "unit-width-hidden"
    | null;
}
