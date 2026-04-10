import test from 'ava';
import { capitalize } from '../utils.js';

test('capitalize should transform the first character to uppercase', t => {
  t.is(capitalize('hello'), 'Hello');
});

