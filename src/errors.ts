/** @public */
export class SkeletonError extends Error {
  code: string
  constructor(code: string, msg: string) {
    super(msg)
    this.code = code
  }
}

/** @internal */
export class BadOptionError extends SkeletonError {
  stem: string
  option: string
  constructor(stem: string, opt: string) {
    super('BAD_OPTION', `Unknown ${stem} option: ${opt}`)
    this.stem = stem
    this.option = opt
  }
}

/** @internal */
export class BadStemError extends SkeletonError {
  stem: string
  constructor(stem: string) {
    super('BAD_STEM', `Unknown stem: ${stem}`)
    this.stem = stem
  }
}

/** @internal */
export class MaskedValueError extends SkeletonError {
  type: string
  prev: any
  constructor(type: string, prev: any) {
    super('MASKED_VALUE', `Value for skeleton type ${type} masks previous`)
    this.type = type
    this.prev = prev
  }
}

/** @internal */
export class MissingOptionError extends SkeletonError {
  stem: any
  constructor(stem: string) {
    super('MISSING_OPTION', `Required option missing for ${stem}`)
    this.stem = stem
  }
}

/** @internal */
export class TooManyOptionsError extends SkeletonError {
  stem: any
  options: any
  constructor(stem: string, options: string[], maxOpt: number) {
    const maxOptStr = maxOpt > 1 ? `${maxOpt} options` : 'one option'
    super(
      'TOO_MANY_OPTIONS',
      `Token ${stem} only supports ${maxOptStr} (got ${options.length})`
    )
    this.stem = stem
    this.options = options
  }
}

/** @internal */
export class UnsupportedError extends SkeletonError {
  stem: string
  source?: string
  constructor(stem: string, source?: string) {
    super('UNSUPPORTED', `The stem ${stem} is not supported`)
    this.stem = stem
    if (source) {
      this.message += ` with value ${source}`
      this.source = source
    }
  }
}
