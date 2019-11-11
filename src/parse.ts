import {
  SkeletonError,
  BadOptionError,
  BadStemError,
  MaskedValueError,
  MissingOptionError,
  TooManyOptionsError
} from "./errors";

const maxOptions = {
  "compact-short": 0,
  "compact-long": 0,
  "notation-simple": 0,
  scientific: 2,
  engineering: 2,
  percent: 0,
  permille: 0,
  "base-unit": 0,
  currency: 1,
  "measure-unit": 1,
  "per-measure-unit": 1,
  "unit-width-narrow": 0,
  "unit-width-short": 0,
  "unit-width-full-name": 0,
  "unit-width-iso-code": 0,
  "unit-width-hidden": 0,
  "precision-integer": 0,
  "precision-unlimited": 0,
  "precision-currency-standard": 0,
  "precision-currency-cash": 0,
  "precision-increment": 1,
  "rounding-mode-ceiling": 0,
  "rounding-mode-floor": 0,
  "rounding-mode-down": 0,
  "rounding-mode-up": 0,
  "rounding-mode-half-even": 0,
  "rounding-mode-half-down": 0,
  "rounding-mode-half-up": 0,
  "rounding-mode-unnecessary": 0,
  "integer-width": 1,
  scale: 1,
  "group-off": 0,
  "group-min2": 0,
  "group-auto": 0,
  "group-on-aligned": 0,
  "group-thousands": 0,
  latin: 0,
  "numbering-system": 1,
  "sign-auto": 0,
  "sign-always": 0,
  "sign-never": 0,
  "sign-accounting": 0,
  "sign-accounting-always": 0,
  "sign-except-zero": 0,
  "sign-accounting-except-zero": 0,
  "decimal-auto": 0,
  "decimal-always": 0
};

const minOptions = {
  currency: 1,
  "integer-width": 1,
  "measure-unit": 1,
  "numbering-system": 1,
  "per-measure-unit": 1,
  "precision-increment": 1,
  scale: 1
};

function hasMaxOption(stem: string): stem is keyof typeof maxOptions {
  return stem in maxOptions;
}

function hasMinOption(stem: string): stem is keyof typeof minOptions {
  return stem in minOptions;
}

function parseUnit(src: string) {
  return /.-./.test(src) ? src : null;
}

function parseDigits(src: string, style: "fraction" | "significant") {
  const re = style === "fraction" ? /^\.(0*)(\+|#*)$/ : /^(@+)(\+|#*)$/;
  const match = src && src.match(re);
  if (match) {
    const min = match[1].length;
    switch (match[2].charAt(0)) {
      case "":
        return { min, max: min };
      case "+":
        return { min, max: null };
      case "#": {
        return { min, max: min + match[2].length };
      }
    }
  }
  return null;
}

type Sign =
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

class Parser {
  errors: SkeletonError[] = [];
  skeleton: Skeleton = {
    decimal: null,
    group: null,
    integerWidth: null,
    notation: null,
    numberingSystem: null,
    precision: null,
    roundingMode: null,
    scale: null,
    sign: null,
    unit: null,
    unitPer: null,
    unitWidth: null
  };

  badOption(stem: string, opt: string) {
    this.errors.push(new BadOptionError(stem, opt));
  }

  isEmpty(key: keyof Skeleton) {
    if (this.skeleton[key])
      this.errors.push(new MaskedValueError(key, this.skeleton[key]));
  }

  parseBlueprints(stem: string, options: string[]) {
    const option = options[0];
    const res = this.skeleton;

    const fd = parseDigits(stem, "fraction");
    if (fd) {
      if (options.length > 1)
        this.errors.push(new TooManyOptionsError(stem, options, 1));
      this.isEmpty("precision");
      res.precision = {
        style: "precision-fraction",
        source: stem,
        minFraction: fd.min
      };
      if (fd.max != null) res.precision.maxFraction = fd.max;
      const sd = parseDigits(option, "significant");
      if (sd) {
        res.precision.source = `${stem}/${option}`;
        res.precision.minSignificant = sd.min;
        if (sd.max != null) res.precision.maxSignificant = sd.max;
      } else if (option) this.badOption(stem, option);
      return;
    }

    const sd = parseDigits(stem, "significant");
    if (sd) {
      for (const opt of options) this.badOption(stem, opt);
      this.isEmpty("precision");
      res.precision = {
        style: "precision-fraction",
        source: stem,
        minSignificant: sd.min
      };
      if (sd.max != null) res.precision.maxSignificant = sd.max;
      return;
    }

    this.errors.push(new BadStemError(stem));
  }

  parseToken(stem: string, options: string[]) {
    const option = options[0];
    const res = this.skeleton;
    if (hasMaxOption(stem)) {
      const maxOpt = maxOptions[stem];
      if (options.length > maxOpt) {
        if (maxOpt === 0) for (const opt of options) this.badOption(stem, opt);
        else this.errors.push(new TooManyOptionsError(stem, options, maxOpt));
      } else if (hasMinOption(stem) && options.length < minOptions[stem])
        this.errors.push(new MissingOptionError(stem));
    }

    switch (stem) {
      // notation
      case "compact-short":
      case "compact-long":
      case "notation-simple":
        this.isEmpty("notation");
        res.notation = { style: stem };
        break;
      case "scientific":
      case "engineering": {
        let expDigits = null;
        let expSign: Sign | null = null;
        for (const opt of options) {
          switch (opt) {
            case "sign-auto":
            case "sign-always":
            case "sign-never":
            case "sign-accounting":
            case "sign-accounting-always":
            case "sign-except-zero":
            case "sign-accounting-except-zero":
              expSign = opt;
              break;
            default:
              if (/^\+e+$/.test(opt)) expDigits = opt.length - 1;
              else {
                this.badOption(stem, opt);
              }
          }
        }
        this.isEmpty("notation");
        res.notation = {
          style: stem,
          source: options.join("/"),
          expDigits,
          expSign
        };
        break;
      }

      // unit
      case "percent":
      case "permille":
      case "base-unit":
        this.isEmpty("unit");
        res.unit = { style: stem };
        break;
      case "currency":
        if (/^[A-Z]{3}$/.test(option)) {
          this.isEmpty("unit");
          res.unit = { style: stem, currency: option };
        } else this.badOption(stem, option);
        break;
      case "measure-unit": {
        const unit = parseUnit(option);
        if (unit) this.isEmpty("unit");
        if (unit) res.unit = { style: stem, unit };
        else this.badOption(stem, option);
        break;
      }

      // unitPer
      case "per-measure-unit": {
        const unit = parseUnit(option);
        if (unit) {
          this.isEmpty("unitPer");
          res.unitPer = unit;
        } else this.badOption(stem, option);
        break;
      }

      // unitWidth
      case "unit-width-narrow":
      case "unit-width-short":
      case "unit-width-full-name":
      case "unit-width-iso-code":
      case "unit-width-hidden":
        this.isEmpty("unitWidth");
        res.unitWidth = stem;
        break;

      // precision
      case "precision-integer":
      case "precision-unlimited":
      case "precision-currency-standard":
      case "precision-currency-cash":
        this.isEmpty("precision");
        res.precision = { style: stem };
        break;
      case "precision-increment": {
        const increment = Number(option);
        if (increment > 0) {
          this.isEmpty("precision");
          res.precision = { style: stem, increment };
        } else this.badOption(stem, option);
        break;
      }
      // TODO: fractions & significant digits

      // roundingMode
      case "rounding-mode-ceiling":
      case "rounding-mode-floor":
      case "rounding-mode-down":
      case "rounding-mode-up":
      case "rounding-mode-half-even":
      case "rounding-mode-half-down":
      case "rounding-mode-half-up":
      case "rounding-mode-unnecessary":
        this.isEmpty("roundingMode");
        res.roundingMode = stem;
        break;

      // integerWidth
      case "integer-width": {
        if (/^\+0*$/.test(option)) {
          this.isEmpty("integerWidth");
          res.integerWidth = { source: option, min: option.length - 1 };
        } else {
          const m = option.match(/^#*(0*)$/);
          if (m) {
            this.isEmpty("integerWidth");
            res.integerWidth = {
              source: option,
              min: m[1].length,
              max: m[0].length
            };
          } else this.badOption(stem, option);
        }
        break;
      }

      // scale
      case "scale": {
        const scale = Number(option);
        if (scale > 0) {
          this.isEmpty("scale");
          res.scale = scale;
        } else this.badOption(stem, option);
        break;
      }

      // group
      case "group-off":
      case "group-min2":
      case "group-auto":
      case "group-on-aligned":
      case "group-thousands":
        this.isEmpty("group");
        res.group = stem;
        break;

      // numberingSystem
      case "latin":
        this.isEmpty("numberingSystem");
        res.numberingSystem = "latn";
        break;
      case "numbering-system": {
        if (option) {
          this.isEmpty("numberingSystem");
          res.numberingSystem = option;
        } else this.badOption(stem, option);
        break;
      }

      // sign
      case "sign-auto":
      case "sign-always":
      case "sign-never":
      case "sign-accounting":
      case "sign-accounting-always":
      case "sign-except-zero":
      case "sign-accounting-except-zero":
        this.isEmpty("sign");
        res.sign = stem;
        break;

      // decimal
      case "decimal-auto":
      case "decimal-always":
        this.isEmpty("decimal");
        res.decimal = stem;
        break;

      // precision blueprints
      default:
        this.parseBlueprints(stem, options);
    }
  }

  get result() {
    return { errors: this.errors, skeleton: this.skeleton };
  }
}

function readTokens(src: string) {
  const tokens = [];
  for (const part of src.split(" ")) {
    if (part) {
      const options = part.split("/");
      const stem = options.shift() || "";
      tokens.push({ stem, options });
    }
  }
  return tokens;
}

export function parseSkeleton(src: string) {
  const parser = new Parser();
  for (const { stem, options } of readTokens(src)) {
    parser.parseToken(stem, options);
  }
  return parser.result;
}
