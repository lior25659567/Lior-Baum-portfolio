import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertArticleBlock } from './articleBlocks.js';

test('bullets ↔ cards keeps the list title both ways', () => {
  const bullets = { id: 'k', type: 'bullets', title: "How we'd know it worked", ordered: false, items: ['Time to create a complete report', 'Report completion rate'] };
  const cards = convertArticleBlock(bullets, 'cards');
  assert.equal(cards.title, "How we'd know it worked");
  assert.deepEqual(cards.items.map((c) => c.title), ['Time to create a complete report', 'Report completion rate']);
  const back = convertArticleBlock(cards, 'bullets');
  assert.equal(back.title, "How we'd know it worked");
  assert.equal(back.items.length, 2);
});
