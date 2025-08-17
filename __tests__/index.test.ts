import { parse, stringify } from '../index';

describe('ts-qs', () => {
  describe('parse', () => {
    it('should parse simple key-value pairs', () => {
      expect(parse('a=b')).toEqual({ a: 'b' });
      expect(parse('a=b&c=d')).toEqual({ a: 'b', c: 'd' });
    });

    it('should parse nested objects', () => {
      expect(parse('foo[bar]=baz')).toEqual({ foo: { bar: 'baz' } });
      expect(parse('foo[bar][baz]=foobarbaz')).toEqual({
        foo: { bar: { baz: 'foobarbaz' } },
      });
    });

    it('should parse arrays', () => {
      expect(parse('a[]=b&a[]=c')).toEqual({ a: ['b', 'c'] });
      expect(parse('a[0]=b&a[1]=c')).toEqual({ a: ['b', 'c'] });
    });

    it('should handle empty values', () => {
      expect(parse('a=')).toEqual({ a: '' });
      expect(parse('a')).toEqual({ a: '' });
    });

    it('should handle null values with strict null handling', () => {
      expect(parse('a', { strictNullHandling: true })).toEqual({ a: null });
      expect(parse('a&b=', { strictNullHandling: true })).toEqual({
        a: null,
        b: '',
      });
    });

    it('should parse with dot notation', () => {
      expect(parse('a.b=c', { allowDots: true })).toEqual({ a: { b: 'c' } });
    });

    it('should handle duplicate keys', () => {
      expect(parse('a=b&a=c')).toEqual({ a: ['b', 'c'] });
      expect(parse('a=b&a=c', { duplicates: 'first' })).toEqual({ a: 'b' });
      expect(parse('a=b&a=c', { duplicates: 'last' })).toEqual({ a: 'c' });
    });

    it('should auto-convert primitives', () => {
      expect(parse('a=123', { parseNumbers: true })).toEqual({ a: 123 });
      expect(parse('a=true', { parseBooleans: true })).toEqual({ a: true });
      expect(parse('a=false', { parseBooleans: true })).toEqual({ a: false });
    });

    it('should parse dates', () => {
      const dateStr = '2023-01-01T00:00:00.000Z';
      const result = parse(`a=${dateStr}`, { parseDates: true });
      expect(result.a).toBeInstanceOf(Date);
      expect((result.a as Date).toISOString()).toBe(dateStr);
    });

    it('should handle comma-separated values', () => {
      expect(parse('a=b,c', { comma: true })).toEqual({ a: ['b', 'c'] });
    });

    it('should ignore query prefix', () => {
      expect(parse('?a=b&c=d', { ignoreQueryPrefix: true })).toEqual({
        a: 'b',
        c: 'd',
      });
    });
  });

  describe('stringify', () => {
    it('should stringify simple objects', () => {
      expect(stringify({ a: 'b' })).toBe('a=b');
      expect(stringify({ a: 'b', c: 'd' })).toBe('a=b&c=d');
    });

    it('should stringify nested objects', () => {
      expect(stringify({ foo: { bar: 'baz' } })).toBe('foo%5Bbar%5D=baz');
    });

    it('should stringify arrays', () => {
      expect(stringify({ a: ['b', 'c'] })).toBe('a%5B0%5D=b&a%5B1%5D=c');
      expect(stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' })).toBe(
        'a%5B%5D=b&a%5B%5D=c'
      );
      expect(stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' })).toBe(
        'a=b&a=c'
      );
      expect(stringify({ a: ['b', 'c'] }, { arrayFormat: 'comma' })).toBe(
        'a=b%2Cc'
      );
    });

    it('should handle null values', () => {
      expect(stringify({ a: null })).toBe('a=');
      expect(stringify({ a: null }, { strictNullHandling: true })).toBe('a');
      expect(stringify({ a: null }, { skipNulls: true })).toBe('');
    });

    it('should stringify with dot notation', () => {
      expect(stringify({ a: { b: 'c' } }, { allowDots: true })).toBe('a.b=c');
    });

    it('should add query prefix', () => {
      expect(stringify({ a: 'b' }, { addQueryPrefix: true })).toBe('?a=b');
    });

    it('should handle Date objects', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      expect(stringify({ a: date })).toBe('a=2023-01-01T00%3A00%3A00.000Z');
    });

    it('should use custom delimiters', () => {
      expect(stringify({ a: 'b', c: 'd' }, { delimiter: ';' })).toBe('a=b;c=d');
    });

    it('should disable encoding', () => {
      expect(stringify({ a: { b: 'c' } }, { encode: false })).toBe('a[b]=c');
    });

    it('should encode values only', () => {
      expect(
        stringify({ 'a[b]': 'c=d' }, { encodeValuesOnly: true })
      ).toBe('a[b]=c%3Dd');
    });

    it('should filter keys', () => {
      expect(stringify({ a: 'b', c: 'd' }, { filter: ['a'] })).toBe('a=b');
    });

    it('should sort keys', () => {
      const sort = (a: string, b: string) => a.localeCompare(b);
      expect(stringify({ c: '3', a: '1', b: '2' }, { sort })).toBe(
        'a=1&b=2&c=3'
      );
    });
  });

  describe('round-trip', () => {
    it('should maintain data integrity through parse-stringify cycle', () => {
      const data = {
        string: 'hello',
        number: 123,
        boolean: true,
        array: ['a', 'b', 'c'],
        object: { nested: 'value' },
        null: null,
        empty: '',
      };

      const stringified = stringify(data);
      const parsed = parse(stringified, {
        parseNumbers: true,
        parseBooleans: true,
      });

      expect(parsed.string).toBe(data.string);
      expect(parsed.number).toBe(data.number);
      expect(parsed.boolean).toBe(data.boolean);
      expect(parsed.array).toEqual(data.array);
      expect(parsed.object).toEqual(data.object);
      expect(parsed.null).toBe('');
      expect(parsed.empty).toBe(data.empty);
    });
  });
});
