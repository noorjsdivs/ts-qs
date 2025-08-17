import { parse, stringify } from '../index';

// Basic usage examples
console.log('=== Basic Examples ===');

// Simple parsing
console.log('parse("a=1&b=2"):', parse('a=1&b=2'));

// Simple stringifying
console.log('stringify({ a: 1, b: 2 }):', stringify({ a: 1, b: 2 }));

// Nested objects
console.log('parse("user[name]=John&user[age]=30"):', parse('user[name]=John&user[age]=30'));
console.log('stringify({ user: { name: "John", age: 30 } }):', stringify({ user: { name: "John", age: 30 } }));

// Arrays
console.log('parse("colors[]=red&colors[]=blue"):', parse('colors[]=red&colors[]=blue'));
console.log('stringify({ colors: ["red", "blue"] }):', stringify({ colors: ["red", "blue"] }));

console.log('\n=== Advanced Examples ===');

// Type conversion
console.log('With number parsing:', parse('a=123&b=45.67', { parseNumbers: true }));
console.log('With boolean parsing:', parse('active=true&disabled=false', { parseBooleans: true }));

// Date parsing
const dateString = '2023-01-01T00:00:00.000Z';
console.log('With date parsing:', parse(`created=${dateString}`, { parseDates: true }));

// Dot notation
console.log('Dot notation parse:', parse('user.profile.name=John', { allowDots: true }));
console.log('Dot notation stringify:', stringify({ user: { profile: { name: 'John' } } }, { allowDots: true }));

// Array formats
const arrayData = { tags: ['javascript', 'typescript', 'node'] };
console.log('Array with indices:', stringify(arrayData, { arrayFormat: 'indices' }));
console.log('Array with brackets:', stringify(arrayData, { arrayFormat: 'brackets' }));
console.log('Array with repeat:', stringify(arrayData, { arrayFormat: 'repeat' }));
console.log('Array with comma:', stringify(arrayData, { arrayFormat: 'comma' }));

// Null handling
console.log('Strict null handling:', parse('a&b=', { strictNullHandling: true }));
console.log('Skip nulls:', stringify({ a: 'value', b: null, c: 'another' }, { skipNulls: true }));

// Custom options
console.log('Custom delimiter:', stringify({ a: 1, b: 2 }, { delimiter: ';' }));
console.log('With query prefix:', stringify({ search: 'term' }, { addQueryPrefix: true }));

console.log('\n=== Complex Example ===');

const complexData = {
  user: {
    id: 123,
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    },
    tags: ['developer', 'javascript', 'typescript'],
    metadata: {
      created: new Date('2023-01-01'),
      active: true,
      score: 95.5
    }
  },
  filters: {
    status: ['active', 'verified'],
    category: 'premium'
  }
};

const queryString = stringify(complexData, {
  allowDots: true,
  arrayFormat: 'brackets'
});

console.log('Complex object stringified:');
console.log(queryString);

const parsed = parse(queryString, {
  allowDots: true,
  parseNumbers: true,
  parseBooleans: true,
  parseDates: true
});

console.log('\nParsed back:');
console.log(JSON.stringify(parsed, null, 2));
