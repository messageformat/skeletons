export type Sign =
  | "sign-auto"
  | "sign-always"
  | "sign-never"
  | "sign-accounting"
  | "sign-accounting-always"
  | "sign-except-zero"
  | "sign-accounting-except-zero";

export interface Skeleton {
  decimal?: "decimal-auto" | "decimal-always";
  group?:
    | "group-off"
    | "group-min2"
    | "group-auto"
    | "group-on-aligned"
    | "group-thousands";
  integerWidth?: { min: number; max?: number; source: string };
  notation?:
    | { style: "compact-short" | "compact-long" | "notation-simple" }
    | {
        style: "scientific" | "engineering";
        expDigits: number | null;
        expSign: Sign | null;
        source: string;
      };
  numberingSystem?: string;
  precision?:
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
      };
  roundingMode?:
    | "rounding-mode-ceiling"
    | "rounding-mode-floor"
    | "rounding-mode-down"
    | "rounding-mode-up"
    | "rounding-mode-half-even"
    | "rounding-mode-half-down"
    | "rounding-mode-half-up"
    | "rounding-mode-unnecessary";
  scale?: number;
  sign?: Sign;
  unit?:
    | { style: "percent" | "permille" | "base-unit" }
    | { style: "currency"; currency: string }
    | { style: "measure-unit"; unit: string };
  unitPer?: string;
  unitWidth?:
    | "unit-width-narrow"
    | "unit-width-short"
    | "unit-width-full-name"
    | "unit-width-iso-code"
    | "unit-width-hidden";
}
