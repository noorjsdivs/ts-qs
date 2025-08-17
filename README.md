# ts-qs

[![npm version](https://img.shields.io/npm/v/ts-qs.svg)](https://www.npmjs.com/package/ts-qs)
[![npm downloads](https://img.shields.io/npm/dm/ts-qs.svg)](https://www.npmjs.com/package/ts-qs)
[![GitHub license](https://img.shields.io/github/license/noorjsdivs/ts-qs.svg)](https://github.com/noorjsdivs/ts-qs/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/noorjsdivs/ts-qs.svg)](https://github.com/noorjsdivs/ts-qs/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![GitHub issues](https://img.shields.io/github/issues/noorjsdivs/ts-qs.svg)](https://github.com/noorjsdivs/ts-qs/issues)

[![YouTube](https://img.shields.io/badge/YouTube-ReactJS%20BD-red.svg?logo=youtube)](https://www.youtube.com/@reactjsBD)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-orange.svg?logo=buy-me-a-coffee)](https://buymeacoffee.com/reactbd)

A modern TypeScript query string parser and stringifier with enhanced type safety, better configuration options, and additional features beyond the original `qs` package.

## ✨ Features

- 🔒 **Full TypeScript Support** - Built from scratch with TypeScript for maximum type safety
- 🚀 **Modern ESM/CJS Support** - Works with both ES modules and CommonJS
- 🎯 **Enhanced Type Safety** - Strong typing for all operations and configurations
- 🔧 **Better Configuration** - More intuitive and powerful configuration options
- 📦 **Zero Dependencies** - Lightweight with no external dependencies
- 🧪 **Auto Type Conversion** - Built-in support for numbers, booleans, and dates
- 🌐 **Multiple Encoding Support** - RFC3986, RFC1738, and custom encoding
- 🎨 **Flexible Array Formats** - Multiple array serialization strategies
- 🔄 **Dot Notation Support** - Parse and stringify with dot notation
- ⚡ **High Performance** - Optimized for speed and memory usage
- 🛡️ **Security First** - Built-in protection against prototype pollution
- 📖 **Comprehensive Documentation** - Detailed docs with examples

## 📦 Installation

```bash
npm install ts-qs
# or
yarn add ts-qs
# or
pnpm add ts-qs
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { parse, stringify } from 'ts-qs';

// Parse query strings
const parsed = parse('name=John&age=30&active=true');
console.log(parsed);
// { name: 'John', age: '30', active: 'true' }

// Stringify objects
const stringified = stringify({ name: 'John', age: 30, active: true });
console.log(stringified);
// 'name=John&age=30&active=true'
```

### With Type Conversion

```typescript
import { parse } from 'ts-qs';

const result = parse(
  'age=30&score=95.5&active=true&created=2023-01-01T00:00:00.000Z',
  {
    parseNumbers: true,
    parseBooleans: true,
    parseDates: true,
  }
);

console.log(result);
// {
//   age: 30,           // number
//   score: 95.5,       // number
//   active: true,      // boolean
//   created: Date      // Date object
// }
```

## 📚 API Reference

### Parse Function

```typescript
parse(input: string, options?: ParseOptions): ParsedQuery
```

#### Parse Options

| Option               | Type                             | Default     | Description                         |
| -------------------- | -------------------------------- | ----------- | ----------------------------------- |
| `allowDots`          | `boolean`                        | `false`     | Enable dot notation parsing         |
| `allowEmptyArrays`   | `boolean`                        | `false`     | Allow empty array values            |
| `allowPrototypes`    | `boolean`                        | `false`     | Allow prototype property overwrites |
| `allowSparse`        | `boolean`                        | `false`     | Allow sparse arrays                 |
| `arrayLimit`         | `number`                         | `20`        | Maximum array index                 |
| `charset`            | `'utf-8' \| 'iso-8859-1'`        | `'utf-8'`   | Character encoding                  |
| `comma`              | `boolean`                        | `false`     | Parse comma-separated values        |
| `delimiter`          | `string \| RegExp`               | `'&'`       | Parameter delimiter                 |
| `depth`              | `number`                         | `5`         | Maximum nesting depth               |
| `duplicates`         | `'combine' \| 'first' \| 'last'` | `'combine'` | Duplicate key handling              |
| `ignoreQueryPrefix`  | `boolean`                        | `false`     | Ignore leading `?`                  |
| `parameterLimit`     | `number`                         | `1000`      | Maximum number of parameters        |
| `parseArrays`        | `boolean`                        | `true`      | Enable array parsing                |
| `parseNumbers`       | `boolean`                        | `false`     | Auto-convert numeric strings        |
| `parseBooleans`      | `boolean`                        | `false`     | Auto-convert boolean strings        |
| `parseDates`         | `boolean`                        | `false`     | Auto-convert ISO date strings       |
| `plainObjects`       | `boolean`                        | `false`     | Create objects without prototype    |
| `strictNullHandling` | `boolean`                        | `false`     | Distinguish null from empty string  |

### Stringify Function

```typescript
stringify(input: StringifyInput, options?: StringifyOptions): string
```

#### Stringify Options

| Option               | Type                                             | Default     | Description                     |
| -------------------- | ------------------------------------------------ | ----------- | ------------------------------- |
| `addQueryPrefix`     | `boolean`                                        | `false`     | Add `?` prefix to result        |
| `allowDots`          | `boolean`                                        | `false`     | Enable dot notation             |
| `allowEmptyArrays`   | `boolean`                                        | `false`     | Include empty arrays            |
| `arrayFormat`        | `'indices' \| 'brackets' \| 'repeat' \| 'comma'` | `'indices'` | Array serialization format      |
| `charset`            | `'utf-8' \| 'iso-8859-1'`                        | `'utf-8'`   | Character encoding              |
| `delimiter`          | `string`                                         | `'&'`       | Parameter delimiter             |
| `encode`             | `boolean`                                        | `true`      | Enable URL encoding             |
| `encodeValuesOnly`   | `boolean`                                        | `false`     | Encode only values, not keys    |
| `filter`             | `Function \| Array`                              | `undefined` | Filter keys or transform values |
| `format`             | `'RFC3986' \| 'RFC1738'`                         | `'RFC3986'` | URL encoding format             |
| `skipNulls`          | `boolean`                                        | `false`     | Skip null values                |
| `sort`               | `Function`                                       | `undefined` | Sort function for keys          |
| `strictNullHandling` | `boolean`                                        | `false`     | Strict null value handling      |

## 📋 Examples

### Nested Objects

```typescript
import { parse, stringify } from 'ts-qs';

// Bracket notation
const nested = parse('user[name]=John&user[profile][age]=30');
console.log(nested);
// { user: { name: 'John', profile: { age: '30' } } }

// Dot notation
const dotNotation = parse('user.name=John&user.profile.age=30', {
  allowDots: true,
});
console.log(dotNotation);
// { user: { name: 'John', profile: { age: '30' } } }

// Stringify with dot notation
const str = stringify({ user: { name: 'John', age: 30 } }, { allowDots: true });
console.log(str);
// 'user.name=John&user.age=30'
```

### Array Handling

```typescript
import { stringify } from 'ts-qs';

const data = { tags: ['javascript', 'typescript', 'node'] };

// Different array formats
console.log(stringify(data, { arrayFormat: 'indices' }));
// 'tags[0]=javascript&tags[1]=typescript&tags[2]=node'

console.log(stringify(data, { arrayFormat: 'brackets' }));
// 'tags[]=javascript&tags[]=typescript&tags[]=node'

console.log(stringify(data, { arrayFormat: 'repeat' }));
// 'tags=javascript&tags=typescript&tags=node'

console.log(stringify(data, { arrayFormat: 'comma' }));
// 'tags=javascript,typescript,node'
```

### Custom Filtering and Sorting

```typescript
import { stringify } from 'ts-qs';

const data = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
  password: 'secret',
};

// Filter out sensitive data
const filtered = stringify(data, {
  filter: (key, value) => (key === 'password' ? undefined : value),
});
console.log(filtered);
// 'name=John&age=30&email=john@example.com'

// Sort keys alphabetically
const sorted = stringify(data, {
  sort: (a, b) => a.localeCompare(b),
});
console.log(sorted);
// 'age=30&email=john@example.com&name=John&password=secret'
```

### Date Handling

```typescript
import { parse, stringify } from 'ts-qs';

// Custom date serialization
const data = { created: new Date('2023-01-01') };
const withCustomDate = stringify(data, {
  serializeDate: date => date.getTime().toString(),
});
console.log(withCustomDate);
// 'created=1672531200000'

// Parse dates
const parsed = parse('created=2023-01-01T00:00:00.000Z', { parseDates: true });
console.log(parsed.created instanceof Date);
// true
```

### Error Handling

```typescript
import { parse, TsQsError } from 'ts-qs';

try {
  parse('a[b][c][d][e][f][g]=value', {
    depth: 3,
    strictDepth: true,
  });
} catch (error) {
  if (error instanceof TsQsError) {
    console.log(error.code); // 'DEPTH_EXCEEDED'
    console.log(error.message); // 'Input depth exceeded...'
  }
}
```

## 🔧 Configuration Classes

For better type safety and validation, you can use configuration classes:

```typescript
import { ParseConfig, StringifyConfig } from 'ts-qs';

// Parse configuration with validation
const parseConfig = new ParseConfig({
  parseNumbers: true,
  parseBooleans: true,
  depth: 10,
});

// Stringify configuration with validation
const stringifyConfig = new StringifyConfig({
  arrayFormat: 'brackets',
  allowDots: true,
  encode: false,
});
```

## 🆚 Comparison with `qs`

| Feature                  | ts-qs       | qs               |
| ------------------------ | ----------- | ---------------- |
| TypeScript Support       | ✅ Built-in | ⚠️ Via @types/qs |
| Type Safety              | ✅ Full     | ⚠️ Limited       |
| Auto Type Conversion     | ✅ Built-in | ❌ No            |
| Modern ES Modules        | ✅ Native   | ⚠️ Partial       |
| Zero Dependencies        | ✅ Yes      | ❌ No            |
| Date Parsing             | ✅ Built-in | ❌ No            |
| Configuration Validation | ✅ Built-in | ❌ No            |
| Error Handling           | ✅ Detailed | ⚠️ Basic         |

## 🛡️ Security

ts-qs includes built-in protection against:

- **Prototype Pollution**: Automatically prevents `__proto__`, `constructor`, and `prototype` overwrites
- **Deep Nesting Attacks**: Configurable depth limits with strict enforcement
- **Parameter Flooding**: Configurable parameter limits
- **Array Overflow**: Configurable array size limits

## 🔗 Links

- **GitHub Repository**: [https://github.com/noorjsdivs/ts-qs](https://github.com/noorjsdivs/ts-qs)
- **NPM Package**: [https://www.npmjs.com/package/ts-qs](https://www.npmjs.com/package/ts-qs)
- **YouTube Channel**: [https://youtube.com/@noorjsdivs](https://youtube.com/@noorjsdivs)
- **Buy Me a Coffee**: [https://www.buymeacoffee.com/noorjsdivs](https://www.buymeacoffee.com/noorjsdivs)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

- Create an issue on [GitHub](https://github.com/noorjsdivs/ts-qs/issues)
- Follow me on [YouTube](https://www.youtube.com/@reactjsBD) for tutorials
- Support the project by [buying me a coffee](https://buymeacoffee.com/reactbd)

---

Built with ❤️ by [Noor Mohammad](https://github.com/noorjsdivs)
