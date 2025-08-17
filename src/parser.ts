import {
  ParseOptions,
  ParseConfig,
  ParsedQuery,
  QueryValue,
  TsQsError,
} from './types';
import {
  defaultDecoder,
  decode,
  detectCharset,
  removeCharsetSentinel,
  parseNumericEntities,
} from './encoding';
import {
  isObject,
  createPlainObject,
  autoConvert,
  safeSetProperty,
  parseBracketNotation,
  isArrayIndex,
  checkLimit,
  splitByDelimiter,
  hasPrototypePollution,
} from './utils';

/**
 * Parse a query string into an object
 */
export function parse(input: string, options: ParseOptions = {}): ParsedQuery {
  const config = new ParseConfig(options);
  const opts = config.options;

  // Handle empty input
  if (!input || typeof input !== 'string') {
    return opts.plainObjects ? createPlainObject() : {};
  }

  let str = input.trim();

  // Remove leading question mark
  if (opts.ignoreQueryPrefix && str.charAt(0) === '?') {
    str = str.slice(1);
  }

  // Handle charset detection
  let charset = opts.charset;
  if (opts.charsetSentinel) {
    charset = detectCharset(str);
    str = removeCharsetSentinel(str);
  }

  // Split into key-value pairs
  const pairs = splitByDelimiter(str, opts.delimiter);
  const result = opts.plainObjects ? createPlainObject() : {};
  let parameterCount = 0;

  for (const pair of pairs) {
    // Check parameter limit
    parameterCount++;
    checkLimit(parameterCount, opts.parameterLimit, 'Parameter', false);
    if (parameterCount > opts.parameterLimit) break;

    // Skip empty pairs
    if (!pair) continue;

    const equalIndex = pair.indexOf('=');
    let key: string;
    let value: string;

    if (equalIndex === -1) {
      // No equals sign - handle as key without value
      key = pair;
      value = opts.strictNullHandling ? '' : '';
    } else {
      key = pair.slice(0, equalIndex);
      value = pair.slice(equalIndex + 1);
    }

    // Decode key and value
    const decodedKey = decodeKey(key, opts, charset);
    const decodedValue = decodeValue(value, opts, charset);

    // Skip if key is empty after decoding
    if (!decodedKey) continue;

    // Parse the key-value pair
    parseKeyValue(result, decodedKey, decodedValue, opts);
  }

  return result;
}

/**
 * Decode a key string
 */
function decodeKey(
  key: string,
  opts: ParseConfig['options'],
  charset: ParseConfig['options']['charset']
): string {
  if (!key) return '';

  try {
    let decoded = opts.decoder
      ? opts.decoder(key, defaultDecoder, charset, 'key')
      : decode(key, defaultDecoder, charset);

    if (opts.interpretNumericEntities) {
      decoded = parseNumericEntities(decoded);
    }

    return decoded;
  } catch {
    return key;
  }
}

/**
 * Decode a value string
 */
function decodeValue(
  value: string,
  opts: ParseConfig['options'],
  charset: ParseConfig['options']['charset']
): QueryValue {
  if (value === '') {
    return opts.strictNullHandling ? null : '';
  }

  try {
    let decoded = opts.decoder
      ? opts.decoder(value, defaultDecoder, charset, 'value')
      : decode(value, defaultDecoder, charset);

    if (opts.interpretNumericEntities) {
      decoded = parseNumericEntities(decoded);
    }

    // Auto-convert primitives
    return autoConvert(
      decoded,
      opts.parseNumbers,
      opts.parseBooleans,
      opts.parseDates
    );
  } catch {
    return value;
  }
}

/**
 * Parse a key-value pair into the result object
 */
function parseKeyValue(
  result: ParsedQuery,
  key: string,
  value: QueryValue,
  opts: ParseConfig['options']
): void {
  // Handle comma-separated values
  if (opts.comma && typeof value === 'string' && value.includes(',')) {
    value = value.split(',').map(v => 
      autoConvert(v.trim(), opts.parseNumbers, opts.parseBooleans, opts.parseDates)
    );
  }

  // Parse key path
  const keyPath = parseKeyPath(key, opts);
  
  // Set nested value
  setNestedValue(result, keyPath, value, opts);
}

/**
 * Parse key into path segments
 */
function parseKeyPath(key: string, opts: ParseConfig['options']): string[] {
  // Handle dot notation
  if (opts.allowDots && key.includes('.')) {
    if (opts.decodeDotInKeys) {
      key = key.replace(/%2E/g, '.');
    }
    return key.split('.');
  }

  // Handle bracket notation
  if (key.includes('[')) {
    return parseBracketNotation(key);
  }

  return [key];
}

/**
 * Set nested value in object
 */
function setNestedValue(
  obj: ParsedQuery,
  keyPath: string[],
  value: QueryValue,
  opts: ParseConfig['options'],
  depth: number = 0
): void {
  // Check depth limit
  if (opts.strictDepth && depth > opts.depth) {
    throw new TsQsError(
      `Input depth exceeded depth option of ${opts.depth} and strictDepth is true`,
      'DEPTH_EXCEEDED'
    );
  }

  if (depth > opts.depth) {
    // Convert remaining path to string
    const remainingKey = keyPath.slice(1).map(k => `[${k}]`).join('');
    const finalKey = keyPath[0] + remainingKey;
    handleDuplicateKey(obj, finalKey, value, opts);
    return;
  }

  if (keyPath.length === 0) return;

  const currentKey = keyPath[0];
  if (!currentKey && currentKey !== '0') return;

  // Check for prototype pollution
  if (!opts.allowPrototypes && hasPrototypePollution(currentKey)) {
    return;
  }

  if (keyPath.length === 1) {
    // Final key - set value
    handleDuplicateKey(obj, currentKey, value, opts);
    return;
  }

  // Create nested object/array
  const nextKey = keyPath[1];
  const isArrayAccess = (nextKey && isArrayIndex(nextKey)) || nextKey === '';

  if (!obj[currentKey]) {
    if (isArrayAccess && opts.parseArrays) {
      obj[currentKey] = [];
    } else {
      obj[currentKey] = opts.plainObjects ? createPlainObject() : {};
    }
  }

  // Handle array notation
  if (isArrayAccess && opts.parseArrays) {
    handleArrayValue(obj, currentKey, keyPath.slice(1), value, opts, depth + 1);
  } else if (isObject(obj[currentKey])) {
    setNestedValue(
      obj[currentKey] as ParsedQuery,
      keyPath.slice(1),
      value,
      opts,
      depth + 1
    );
  }
}

/**
 * Handle array value assignment
 */
function handleArrayValue(
  obj: ParsedQuery,
  key: string,
  remainingPath: string[],
  value: QueryValue,
  opts: ParseConfig['options'],
  depth: number
): void {
  const arr = obj[key] as unknown[];
  const indexKey = remainingPath[0];

  if (indexKey === '') {
    // Empty brackets - push to array
    if (remainingPath.length === 1) {
      arr.push(value);
    } else {
      const newObj = opts.plainObjects ? createPlainObject() : {};
      arr.push(newObj);
      setNestedValue(newObj, remainingPath.slice(1), value, opts, depth);
    }
  } else if (indexKey && isArrayIndex(indexKey)) {
    // Numeric index
    const index = parseInt(indexKey, 10);
    
    // Check array limit
    if (index > opts.arrayLimit) {
      // Convert to object
      if (!isObject(obj[key])) {
        obj[key] = opts.plainObjects ? createPlainObject() : {};
      }
      setNestedValue(obj[key] as ParsedQuery, remainingPath, value, opts, depth);
      return;
    }

    // Ensure array is large enough
    while (arr.length <= index) {
      arr.push(undefined);
    }

    if (remainingPath.length === 1) {
      if (opts.allowEmptyArrays && value === '') {
        arr[index] = [];
      } else {
        arr[index] = value;
      }
    } else {
      if (!arr[index]) {
        arr[index] = opts.plainObjects ? createPlainObject() : {};
      }
      setNestedValue(
        arr[index] as ParsedQuery,
        remainingPath.slice(1),
        value,
        opts,
        depth
      );
    }
  } else {
    // Convert array to object for non-numeric keys
    const objValue = opts.plainObjects ? createPlainObject() : {};
    
    // Copy existing array elements
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== undefined) {
        objValue[i.toString()] = arr[i];
      }
    }
    
    obj[key] = objValue;
    setNestedValue(objValue, remainingPath, value, opts, depth);
  }
}

/**
 * Handle duplicate keys according to strategy
 */
function handleDuplicateKey(
  obj: ParsedQuery,
  key: string,
  value: QueryValue,
  opts: ParseConfig['options']
): void {
  const existing = obj[key];

  if (existing === undefined) {
    safeSetProperty(obj, key, value, opts.allowPrototypes);
    return;
  }

  switch (opts.duplicates) {
    case 'first':
      // Keep first value, ignore subsequent ones
      break;

    case 'last':
      // Replace with last value
      safeSetProperty(obj, key, value, opts.allowPrototypes);
      break;

    case 'combine':
    default:
      // Combine into array
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        safeSetProperty(obj, key, [existing, value], opts.allowPrototypes);
      }
      break;
  }
}
