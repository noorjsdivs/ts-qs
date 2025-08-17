/**
 * ts-qs - A modern TypeScript query string parser with enhanced type safety
 * 
 * @author Noor Mohammad
 * @license MIT
 */

// Export main functions
export { parse } from './parser';
export { stringify } from './stringifier';

// Import for default export
import { parse } from './parser';
import { stringify } from './stringifier';

// Export types and interfaces
export type {
  PrimitiveValue,
  ArrayFormat,
  DuplicateStrategy,
  Charset,
  Format,
  EncoderFunction,
  DecoderFunction,
  FilterFunction,
  SortFunction,
  SerializeDateFunction,
  ParseOptions,
  StringifyOptions,
  ParsedQuery,
  QueryValue,
  StringifyInput,
} from './types';

// Export configuration classes
export { ParseConfig, StringifyConfig, TsQsError } from './types';

// Export utility functions
export {
  rfc3986Encoder,
  rfc1738Encoder,
  defaultDecoder,
  getEncoder,
} from './encoding';

// Export utility helpers
export {
  isObject,
  isPlainObject,
  createPlainObject,
  isNumericString,
  isBooleanString,
  isDateString,
  autoConvert,
} from './utils';

// Default export with both functions
const tsqs = {
  parse,
  stringify,
};

export default tsqs;
