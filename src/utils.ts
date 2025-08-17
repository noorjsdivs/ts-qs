import { QueryValue, TsQsError } from './types';

/**
 * Check if a value is an object (not array, null, or primitive)
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Check if a value is a plain object (created by {} or new Object())
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) return false;
  
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Create a plain object without prototype
 */
export const createPlainObject = (): Record<string, unknown> => {
  return Object.create(null);
};

/**
 * Deep merge two objects
 */
export const deepMerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> => {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
};

/**
 * Convert value to array if it's not already
 */
export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Compact array by removing undefined elements
 */
export function compactArray<T>(arr: Array<T | undefined>): T[] {
  return arr.filter((item): item is T => item !== undefined);
}

/**
 * Check if a string represents a number
 */
export const isNumericString = (str: string): boolean => {
  return /^-?\d+(\.\d+)?$/.test(str) && !isNaN(Number(str));
};

/**
 * Check if a string represents a boolean
 */
export const isBooleanString = (str: string): boolean => {
  return str === 'true' || str === 'false';
};

/**
 * Check if a string represents an ISO date
 */
export const isDateString = (str: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(str)) {
    return false;
  }
  const date = new Date(str);
  return !isNaN(date.getTime());
};

/**
 * Auto-convert string to appropriate primitive type
 */
export const autoConvert = (
  str: string,
  parseNumbers: boolean,
  parseBooleans: boolean,
  parseDates: boolean
): QueryValue => {
  if (str === '') return str;
  
  if (parseBooleans && isBooleanString(str)) {
    return str === 'true';
  }
  
  if (parseNumbers && isNumericString(str)) {
    return Number(str);
  }
  
  if (parseDates && isDateString(str)) {
    return new Date(str);
  }
  
  return str;
};

/**
 * Check if an object has prototype pollution potential
 */
export const hasPrototypePollution = (key: string): boolean => {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
};

/**
 * Safely set nested property
 */
export const safeSetProperty = (
  obj: Record<string, unknown>,
  key: string,
  value: unknown,
  allowPrototypes: boolean
): void => {
  if (!allowPrototypes && hasPrototypePollution(key)) {
    return;
  }
  
  obj[key] = value;
};

/**
 * Get nested property path
 */
export const getNestedPath = (keys: string[]): string => {
  if (keys.length === 0) return '';
  if (keys.length === 1) return keys[0] || '';
  
  const first = keys[0] || '';
  const rest = keys.slice(1).map(key => `[${key}]`).join('');
  return first + rest;
};

/**
 * Parse bracket notation into path segments
 */
export const parseBracketNotation = (key: string): string[] => {
  const segments: string[] = [];
  let current = '';
  let inBrackets = false;
  let bracketDepth = 0;
  
  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    
    if (char === '[' && !inBrackets) {
      if (current) {
        segments.push(current);
        current = '';
      }
      inBrackets = true;
      bracketDepth = 1;
    } else if (char === '[' && inBrackets) {
      bracketDepth++;
      current += char;
    } else if (char === ']' && inBrackets) {
      bracketDepth--;
      if (bracketDepth === 0) {
        segments.push(current);
        current = '';
        inBrackets = false;
      } else {
        current += char;
      }
    } else {
      current += char;
    }
  }
  
  if (current) {
    segments.push(current);
  }
  
  return segments;
};

/**
 * Check if a key represents an array index
 */
export const isArrayIndex = (key: string): boolean => {
  return /^\d+$/.test(key);
};

/**
 * Convert object to array if all keys are numeric indices
 */
export const maybeConvertToArray = (
  obj: Record<string, unknown>,
  allowSparse: boolean = false
): unknown[] | Record<string, unknown> => {
  const keys = Object.keys(obj);
  
  if (keys.length === 0) return obj;
  
  // Check if all keys are numeric
  const allNumeric = keys.every(isArrayIndex);
  if (!allNumeric) return obj;
  
  // Convert to array
  const indices = keys.map(Number).sort((a, b) => a - b);
  const maxIndex = Math.max(...indices);
  
  // Check for sparse array
  if (!allowSparse && maxIndex >= keys.length * 2) {
    return obj; // Too sparse, keep as object
  }
  
  const arr: unknown[] = [];
  for (const key of keys) {
    const index = Number(key);
    arr[index] = obj[key];
  }
  
  return allowSparse ? arr : compactArray(arr);
};

/**
 * Throw error if limit exceeded
 */
export const checkLimit = (
  current: number,
  limit: number,
  type: string,
  throwOnExceeded: boolean = false
): void => {
  if (current > limit) {
    if (throwOnExceeded) {
      throw new TsQsError(
        `${type} limit exceeded. Only ${limit} ${type.toLowerCase()} allowed.`,
        `LIMIT_EXCEEDED_${type.toUpperCase()}`
      );
    }
  }
};

/**
 * Escape special regex characters
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Split string by delimiter (string or regex)
 */
export const splitByDelimiter = (str: string, delimiter: string | RegExp): string[] => {
  if (delimiter instanceof RegExp) {
    return str.split(delimiter);
  }
  return str.split(delimiter);
};
