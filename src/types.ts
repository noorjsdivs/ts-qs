/**
 * Supported primitive types for query string values
 */
export type PrimitiveValue = string | number | boolean | null | undefined;

/**
 * Supported array formats for stringification
 */
export type ArrayFormat =
  | 'indices' // a[0]=b&a[1]=c
  | 'brackets' // a[]=b&a[]=c
  | 'repeat' // a=b&a=c
  | 'comma'; // a=b,c

/**
 * Supported duplicate key handling strategies
 */
export type DuplicateStrategy = 'combine' | 'first' | 'last';

/**
 * Charset encoding options
 */
export type Charset = 'utf-8' | 'iso-8859-1';

/**
 * URL encoding format
 */
export type Format = 'RFC3986' | 'RFC1738';

/**
 * Custom encoder function type
 */
export type EncoderFunction = (
  str: string,
  defaultEncoder: (str: string) => string,
  charset: Charset,
  type: 'key' | 'value'
) => string;

/**
 * Custom decoder function type
 */
export type DecoderFunction = (
  str: string,
  defaultDecoder: (str: string) => string,
  charset: Charset,
  type: 'key' | 'value'
) => string;

/**
 * Custom filter function for stringification
 */
export type FilterFunction = (prefix: string, value: unknown) => unknown;

/**
 * Custom sort function for key ordering
 */
export type SortFunction = (a: string, b: string) => number;

/**
 * Custom serialize function for Date objects
 */
export type SerializeDateFunction = (date: Date) => string;

/**
 * Configuration options for parsing query strings
 */
export interface ParseOptions {
  /** Allow dot notation (a.b=c becomes {a: {b: 'c'}}) */
  allowDots?: boolean;
  /** Allow empty arrays (foo[]&bar=baz becomes {foo: [], bar: 'baz'}) */
  allowEmptyArrays?: boolean;
  /** Allow prototype properties to be overwritten */
  allowPrototypes?: boolean;
  /** Allow sparse arrays */
  allowSparse?: boolean;
  /** Maximum array index (default: 20) */
  arrayLimit?: number;
  /** Charset for decoding (default: 'utf-8') */
  charset?: Charset;
  /** Enable charset detection via utf8 parameter */
  charsetSentinel?: boolean;
  /** Enable comma-separated values parsing */
  comma?: boolean;
  /** Decode dots in keys when allowDots is true */
  decodeDotInKeys?: boolean;
  /** Custom decoder function */
  decoder?: DecoderFunction;
  /** Custom delimiter (default: '&') */
  delimiter?: string | RegExp;
  /** Maximum nesting depth (default: 5) */
  depth?: number;
  /** Handle duplicate keys strategy */
  duplicates?: DuplicateStrategy;
  /** Ignore leading question mark */
  ignoreQueryPrefix?: boolean;
  /** Interpret numeric HTML entities */
  interpretNumericEntities?: boolean;
  /** Maximum number of parameters (default: 1000) */
  parameterLimit?: number;
  /** Parse arrays (default: true) */
  parseArrays?: boolean;
  /** Use plain objects without prototype */
  plainObjects?: boolean;
  /** Strict null handling */
  strictNullHandling?: boolean;
  /** Throw error when limits are exceeded */
  strictDepth?: boolean;
  /** Auto-convert string values to primitives */
  parseNumbers?: boolean;
  /** Auto-convert boolean strings */
  parseBooleans?: boolean;
  /** Parse dates from ISO strings */
  parseDates?: boolean;
}

/**
 * Configuration options for stringifying objects to query strings
 */
export interface StringifyOptions {
  /** Add question mark prefix */
  addQueryPrefix?: boolean;
  /** Allow dot notation */
  allowDots?: boolean;
  /** Allow empty arrays */
  allowEmptyArrays?: boolean;
  /** Array format for stringification */
  arrayFormat?: ArrayFormat;
  /** Charset for encoding */
  charset?: Charset;
  /** Add charset sentinel */
  charsetSentinel?: boolean;
  /** Comma round-trip for single arrays */
  commaRoundTrip?: boolean;
  /** Custom delimiter */
  delimiter?: string;
  /** Enable encoding (default: true) */
  encode?: boolean;
  /** Encode dots in keys */
  encodeDotInKeys?: boolean;
  /** Encode values only, not keys */
  encodeValuesOnly?: boolean;
  /** Custom encoder function */
  encoder?: EncoderFunction;
  /** Custom filter function or array of allowed keys */
  filter?: FilterFunction | (string | number)[];
  /** URL encoding format */
  format?: Format;
  /** Legacy indices format (use arrayFormat instead) */
  indices?: boolean;
  /** Custom serialize date function */
  serializeDate?: SerializeDateFunction;
  /** Skip null values */
  skipNulls?: boolean;
  /** Custom sort function */
  sort?: SortFunction;
  /** Strict null handling */
  strictNullHandling?: boolean;
}

/**
 * Parsed query string result type
 */
export type ParsedQuery = Record<string, unknown>;

/**
 * Query string value type
 */
export type QueryValue = 
  | PrimitiveValue 
  | Date
  | PrimitiveValue[] 
  | Record<string, unknown>
  | QueryValue[];

/**
 * Input object for stringification
 */
export type StringifyInput = Record<string, QueryValue>;

/**
 * Error thrown when parsing/stringifying limits are exceeded
 */
export class TsQsError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'TsQsError';
  }
}

/**
 * Parser configuration with validation
 */
export class ParseConfig {
  public readonly options: Required<ParseOptions>;

  constructor(options: ParseOptions = {}) {
    this.options = {
      allowDots: false,
      allowEmptyArrays: false,
      allowPrototypes: false,
      allowSparse: false,
      arrayLimit: 20,
      charset: 'utf-8',
      charsetSentinel: false,
      comma: false,
      decodeDotInKeys: false,
      decoder: undefined as any,
      delimiter: '&',
      depth: 5,
      duplicates: 'combine',
      ignoreQueryPrefix: false,
      interpretNumericEntities: false,
      parameterLimit: 1000,
      parseArrays: true,
      plainObjects: false,
      strictNullHandling: false,
      strictDepth: false,
      parseNumbers: false,
      parseBooleans: false,
      parseDates: false,
      ...options,
    };

    this.validate();
  }

  private validate(): void {
    if (this.options.arrayLimit < 0) {
      throw new TsQsError('arrayLimit must be non-negative', 'INVALID_ARRAY_LIMIT');
    }
    if (this.options.depth < 0) {
      throw new TsQsError('depth must be non-negative', 'INVALID_DEPTH');
    }
    if (this.options.parameterLimit < 0) {
      throw new TsQsError('parameterLimit must be non-negative', 'INVALID_PARAMETER_LIMIT');
    }
    if (this.options.decodeDotInKeys && !this.options.allowDots) {
      throw new TsQsError('decodeDotInKeys requires allowDots to be true', 'INVALID_DOT_DECODE');
    }
  }
}

/**
 * Stringify configuration with validation
 */
export class StringifyConfig {
  public readonly options: Required<StringifyOptions>;

  constructor(options: StringifyOptions = {}) {
    this.options = {
      addQueryPrefix: false,
      allowDots: false,
      allowEmptyArrays: false,
      arrayFormat: 'indices',
      charset: 'utf-8',
      charsetSentinel: false,
      commaRoundTrip: false,
      delimiter: '&',
      encode: true,
      encodeDotInKeys: false,
      encodeValuesOnly: false,
      encoder: undefined as any,
      filter: undefined as any,
      format: 'RFC3986',
      indices: true,
      serializeDate: undefined as any,
      skipNulls: false,
      sort: undefined as any,
      strictNullHandling: false,
      ...options,
    };

    this.validate();
  }

  private validate(): void {
    if (this.options.encodeDotInKeys && !this.options.allowDots) {
      throw new TsQsError('encodeDotInKeys requires allowDots to be true', 'INVALID_DOT_ENCODE');
    }
  }
}
