import {
  StringifyOptions,
  StringifyConfig,
  StringifyInput,
  QueryValue,
} from "./types";
import { getEncoder, encode, addCharsetSentinel } from "./encoding";
import { isObject } from "./utils";

/**
 * Stringify an object into a query string
 */
export function stringify(
  input: StringifyInput,
  options: StringifyOptions = {}
): string {
  const config = new StringifyConfig(options);
  const opts = config.options;

  if (!input || typeof input !== "object") {
    return "";
  }

  // Apply filter if specified
  const filtered = applyFilter(input, opts.filter);

  // Sort keys if specified
  const keys = Object.keys(filtered);
  if (opts.sort) {
    keys.sort(opts.sort);
  }

  // Convert to query string pairs
  const pairs: string[] = [];
  const encoder = opts.encode ? getEncoder(opts.format) : (str: string) => str;

  for (const key of keys) {
    const value = filtered[key];
    if (value === undefined) continue;

    if (opts.skipNulls && value === null) continue;

    const encodedPairs = stringifyValue(key, value, encoder, opts, []);

    pairs.push(...encodedPairs);
  }

  let result = pairs.join(opts.delimiter);

  // Add charset sentinel if needed
  if (opts.charsetSentinel) {
    result = addCharsetSentinel(result, opts.charset);
  }

  // Add query prefix if needed
  if (opts.addQueryPrefix && result) {
    result = "?" + result;
  }

  return result;
}

/**
 * Apply filter to input object
 */
function applyFilter(
  input: StringifyInput,
  filter: StringifyConfig["options"]["filter"]
): StringifyInput {
  if (!filter) return input;

  if (Array.isArray(filter)) {
    // Array of allowed keys
    const result: StringifyInput = {};
    for (const key of filter) {
      const stringKey = String(key);
      if (stringKey in input) {
        result[stringKey] = input[stringKey];
      }
    }
    return result;
  }

  if (typeof filter === "function") {
    // Filter function
    const result: StringifyInput = {};
    for (const [key, value] of Object.entries(input)) {
      const filtered = filter(key, value);
      if (filtered !== undefined) {
        result[key] = filtered as QueryValue;
      }
    }
    return result;
  }

  return input;
}

/**
 * Stringify a single value
 */
function stringifyValue(
  key: string,
  value: QueryValue,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"],
  keyPath: string[]
): string[] {
  if (value === null) {
    return stringifyNull(key, encoder, opts);
  }

  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return stringifyArray(key, value, encoder, opts, keyPath);
  }

  if (value instanceof Date) {
    return stringifyDate(key, value, encoder, opts);
  }

  if (isObject(value)) {
    return stringifyObject(key, value, encoder, opts, keyPath);
  }

  // Primitive values
  return stringifyPrimitive(key, value, encoder, opts);
}

/**
 * Stringify null value
 */
function stringifyNull(
  key: string,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"]
): string[] {
  if (opts.strictNullHandling) {
    return [encodeKey(key, encoder, opts)];
  }
  return [encodeKey(key, encoder, opts) + "="];
}

/**
 * Stringify primitive value
 */
function stringifyPrimitive(
  key: string,
  value: string | number | boolean,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"]
): string[] {
  const encodedKey = encodeKey(key, encoder, opts);
  const encodedValue = encodeValue(String(value), encoder, opts);
  return [encodedKey + "=" + encodedValue];
}

/**
 * Stringify Date value
 */
function stringifyDate(
  key: string,
  value: Date,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"]
): string[] {
  const encodedKey = encodeKey(key, encoder, opts);
  let dateString: string;

  if (opts.serializeDate) {
    dateString = opts.serializeDate(value);
  } else {
    dateString = value.toISOString();
  }

  const encodedValue = encodeValue(dateString, encoder, opts);
  return [encodedKey + "=" + encodedValue];
}

/**
 * Stringify array value
 */
function stringifyArray(
  key: string,
  array: QueryValue[],
  encoder: (str: string) => string,
  opts: StringifyConfig["options"],
  keyPath: string[]
): string[] {
  if (array.length === 0) {
    if (opts.allowEmptyArrays) {
      return [encodeKey(key, encoder, opts) + "[]"];
    }
    return [];
  }

  const pairs: string[] = [];

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (value === undefined) continue;

    let arrayKey: string;
    switch (opts.arrayFormat) {
      case "indices":
        arrayKey = `${key}[${i}]`;
        break;
      case "brackets":
        arrayKey = `${key}[]`;
        break;
      case "repeat":
        arrayKey = key;
        break;
      case "comma":
        // Handle comma format specially
        if (i === 0) {
          const values = array
            .filter((v) => v !== undefined)
            .map((v) => encodeValue(String(v), encoder, opts))
            .join(encoder(","));
          return [encodeKey(key, encoder, opts) + "=" + values];
        }
        continue;
      default:
        arrayKey = opts.indices ? `${key}[${i}]` : `${key}[]`;
    }

    const valuePairs = stringifyValue(arrayKey, value, encoder, opts, [
      ...keyPath,
      key,
    ]);
    pairs.push(...valuePairs);
  }

  return pairs;
}

/**
 * Stringify object value
 */
function stringifyObject(
  key: string,
  obj: Record<string, unknown>,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"],
  keyPath: string[]
): string[] {
  const pairs: string[] = [];
  const objKeys = Object.keys(obj);

  if (opts.sort) {
    objKeys.sort(opts.sort);
  }

  for (const objKey of objKeys) {
    const value = obj[objKey] as QueryValue;
    if (value === undefined) continue;

    if (opts.skipNulls && value === null) continue;

    let nestedKey: string;
    if (opts.allowDots) {
      nestedKey = opts.encodeDotInKeys
        ? `${key}.${objKey.replace(/\./g, "%2E")}`
        : `${key}.${objKey}`;
    } else {
      nestedKey = `${key}[${objKey}]`;
    }

    const valuePairs = stringifyValue(nestedKey, value, encoder, opts, [
      ...keyPath,
      key,
    ]);
    pairs.push(...valuePairs);
  }

  return pairs;
}

/**
 * Encode a key
 */
function encodeKey(
  key: string,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"]
): string {
  if (!opts.encode) return key;

  if (opts.encoder) {
    return opts.encoder(key, encoder, opts.charset, "key");
  }

  if (opts.encodeValuesOnly) {
    return key;
  }

  return encode(key, encoder, opts.charset);
}

/**
 * Encode a value
 */
function encodeValue(
  value: string,
  encoder: (str: string) => string,
  opts: StringifyConfig["options"]
): string {
  if (!opts.encode) return value;

  if (opts.encoder) {
    return opts.encoder(value, encoder, opts.charset, "value");
  }

  return encode(value, encoder, opts.charset);
}
