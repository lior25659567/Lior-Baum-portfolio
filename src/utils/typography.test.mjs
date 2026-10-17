import { test } from 'node:test';
import assert from 'node:assert/strict';
import { widont } from './typography.js';

const NB = ' ';

test('joins the last two words so the last line never holds one word', () => {
  assert.equal(widont('The old builder worked but editing felt like guesswork.'), `The old builder worked but editing felt like${NB}guesswork.`);
});

test('keeps **bold** markers intact', () => {
  assert.equal(widont("The editor's structure **wasn't built to scale.**"), `The editor's structure **wasn't built to${NB}scale.**`);
});

test('leaves short texts and trailing whitespace alone', () => {
  assert.equal(widont('Impact'), 'Impact');
  assert.equal(widont('Two words'), 'Two words');
  assert.equal(widont('Ends with space here  '), `Ends with space${NB}here  `);
});

test('skips when the last two words are too long to share a narrow line', () => {
  const long = 'Keep this sentence internationalization-heavy supercalifragilistic';
  assert.equal(widont(long), long);
});

test('ignores non-strings', () => {
  assert.equal(widont(undefined), undefined);
  assert.equal(widont(null), null);
});
