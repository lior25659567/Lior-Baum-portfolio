import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  libraryItemRef, newLibraryItemId, classifyMediaItem,
  collectStudyMedia, mergeIntoLibrary, usageCount,
} from './mediaLibrary.js';

const project = {
  slides: [
    { type: 'intro', logo: '/case-studies/x/logo.webp', image: [{ src: '/case-studies/x/a.webp', caption: 'A' }] },
    { type: 'media', image: 'data:video/mp4;base64,AAAA' },
    { type: 'textAndImage', image: '', imageEmbedUrl: 'https://www.figma.com/embed?node=1' },
    { type: 'comparison', beforeImage: '/case-studies/x/b.webp', afterImage: '/case-studies/x/a.webp' }, // a.webp dup
  ],
  article: { blocks: [
    { id: 'b1', type: 'figure', media: [{ src: '/case-studies/x/c.webp' }, { embedUrl: 'https://youtu.be/abc' }] },
    { id: 'b2', type: 'paragraph', text: 'no media' },
  ] },
  mediaLibrary: [],
  mediaLibraryRemoved: [],
};

test('libraryItemRef prefers src then embedUrl', () => {
  assert.equal(libraryItemRef({ src: ' /x/a.webp ' }), '/x/a.webp');
  assert.equal(libraryItemRef({ embedUrl: 'https://f.com' }), 'https://f.com');
  assert.equal(libraryItemRef({}), '');
});

test('newLibraryItemId is deterministic per ref', () => {
  assert.equal(newLibraryItemId('/x/a.webp'), newLibraryItemId('/x/a.webp'));
  assert.notEqual(newLibraryItemId('/x/a.webp'), newLibraryItemId('/x/b.webp'));
  assert.match(newLibraryItemId('/x/a.webp'), /^ml-/);
});

test('classifyMediaItem covers image/video/figma/youtube/embed', () => {
  assert.equal(classifyMediaItem({ src: '/x/a.webp' }), 'image');
  assert.equal(classifyMediaItem({ src: '/x/a.mp4' }), 'video');
  assert.equal(classifyMediaItem({ src: 'data:video/mp4;base64,AA', isVideo: true }), 'video');
  assert.equal(classifyMediaItem({ embedUrl: 'https://www.figma.com/embed?x' }), 'figma');
  assert.equal(classifyMediaItem({ embedUrl: 'https://youtu.be/abc' }), 'youtube');
  assert.equal(classifyMediaItem({ embedUrl: 'https://example.com/x' }), 'embed');
});

test('collectStudyMedia walks slides + article, dedupes by ref', () => {
  const items = collectStudyMedia(project);
  const refs = items.map(libraryItemRef);
  assert.ok(refs.includes('/case-studies/x/logo.webp'));
  assert.ok(refs.includes('/case-studies/x/a.webp'));
  assert.ok(refs.includes('data:video/mp4;base64,AAAA'));
  assert.ok(refs.includes('https://www.figma.com/embed?node=1'));
  assert.ok(refs.includes('/case-studies/x/c.webp'));
  assert.ok(refs.includes('https://youtu.be/abc'));
  // a.webp appears twice in data but must be deduped
  assert.equal(refs.filter((r) => r === '/case-studies/x/a.webp').length, 1);
  // the video item must be flagged isVideo (data:video can't be sniffed by extension)
  assert.equal(items.find((i) => i.src === 'data:video/mp4;base64,AAAA').isVideo, true);
});

test('mergeIntoLibrary is additive, deduped, tombstone-aware', () => {
  const merged = mergeIntoLibrary(project, 1000);
  assert.ok(merged.length >= 6);
  assert.ok(merged.every((i) => i.id && i.addedAt === 1000));
  // idempotent: merging the result back adds nothing (same ref returned)
  const again = mergeIntoLibrary({ ...project, mediaLibrary: merged }, 2000);
  assert.equal(again, merged);
  // tombstoned ref is not re-added
  const tomb = mergeIntoLibrary({ ...project, mediaLibrary: [], mediaLibraryRemoved: ['/case-studies/x/c.webp'] }, 3000);
  assert.equal(tomb.some((i) => libraryItemRef(i) === '/case-studies/x/c.webp'), false);
});

test('usageCount counts references across slides + article', () => {
  assert.equal(usageCount(project, '/case-studies/x/a.webp'), 2); // intro image + comparison afterImage
  assert.equal(usageCount(project, '/case-studies/x/c.webp'), 1);
  assert.equal(usageCount(project, '/case-studies/x/missing.webp'), 0);
});
