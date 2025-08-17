import { Charset, Format } from './types';

/**
 * Default RFC 3986 encoder
 */
export const rfc3986Encoder = (str: string): string => {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
};

/**
 * Default RFC 1738 encoder (spaces as +)
 */
export const rfc1738Encoder = (str: string): string => {
  return rfc3986Encoder(str).replace(/%20/g, '+');
};

/**
 * Default decoder
 */
export const defaultDecoder = (str: string): string => {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
};

/**
 * Get appropriate encoder based on format
 */
export const getEncoder = (format: Format): ((str: string) => string) => {
  switch (format) {
    case 'RFC1738':
      return rfc1738Encoder;
    case 'RFC3986':
    default:
      return rfc3986Encoder;
  }
};

/**
 * Encode string based on charset
 */
export const encode = (
  str: string,
  defaultEncoder: (str: string) => string,
  charset: Charset
): string => {
  if (charset === 'iso-8859-1') {
    return encodeISO88591(str);
  }
  return defaultEncoder(str);
};

/**
 * Decode string based on charset
 */
export const decode = (
  str: string,
  defaultDecoder: (str: string) => string,
  charset: Charset
): string => {
  if (charset === 'iso-8859-1') {
    return decodeISO88591(str);
  }
  return defaultDecoder(str);
};

/**
 * ISO-8859-1 encoder
 */
const encodeISO88591 = (str: string): string => {
  let encoded = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0xff) {
      encoded += `%${code.toString(16).toUpperCase().padStart(2, '0')}`;
    } else {
      encoded += `%26%23${code}%3B`; // Numeric entity
    }
  }
  return encoded;
};

/**
 * ISO-8859-1 decoder
 */
const decodeISO88591 = (str: string): string => {
  return str.replace(/%([0-9A-F]{2})/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    return String.fromCharCode(code);
  });
};

/**
 * Parse numeric entities
 */
export const parseNumericEntities = (str: string): string => {
  return str.replace(/&#(\d+);/g, (_, num) => {
    const code = parseInt(num, 10);
    return String.fromCharCode(code);
  });
};

/**
 * Detect charset from utf8 sentinel
 */
export const detectCharset = (str: string): Charset => {
  // Look for utf8 parameter with checkmark
  const utf8Match = str.match(/utf8=([^&]*)/);
  if (utf8Match && utf8Match[1]) {
    const value = decodeURIComponent(utf8Match[1]);
    // UTF-8 checkmark: ✓
    if (value === '✓') return 'utf-8';
    // ISO-8859-1 checkmark: &#10003;
    if (value.includes('10003')) return 'iso-8859-1';
  }
  return 'utf-8';
};

/**
 * Add charset sentinel to string
 */
export const addCharsetSentinel = (str: string, charset: Charset): string => {
  const sentinel = charset === 'utf-8' ? 'utf8=%E2%9C%93' : 'utf8=%26%2310003%3B';
  return str ? `${sentinel}&${str}` : sentinel;
};

/**
 * Remove charset sentinel from string
 */
export const removeCharsetSentinel = (str: string): string => {
  return str.replace(/^utf8=[^&]*&?/, '');
};
