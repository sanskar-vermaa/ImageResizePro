// Unit tests for pure helpers. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBytes, renameExt, addSuffix, percentChange, clamp } from '../assets/js/core/utils.js';
import { uniqueNames } from '../assets/js/core/download.js';
import { computeResize } from '../assets/js/tools/resize.js';
import { parseRange } from '../assets/js/tools/pdf-to-image.js';
import { layoutImages } from '../assets/js/tools/merge.js';
import { rotatedSize } from '../assets/js/tools/rotate.js';
import { dataUrlToBlob } from '../assets/js/tools/base64.js';

test('formatBytes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5 MB');
});

test('renameExt / addSuffix', () => {
  assert.equal(renameExt('photo.png', 'jpg'), 'photo.jpg');
  assert.equal(renameExt('my.holiday.photo.jpeg', 'webp'), 'my.holiday.photo.webp');
  assert.equal(renameExt('noext', 'png'), 'noext.png');
  assert.equal(addSuffix('a.jpg', 'small'), 'a-small.jpg');
});

test('percentChange and clamp', () => {
  assert.equal(percentChange(100, 25), 75);
  assert.equal(percentChange(100, 150), -50);
  assert.equal(clamp(5, 0, 3), 3);
});

test('uniqueNames avoids ZIP collisions', () => {
  assert.deepEqual(uniqueNames(['a.jpg', 'a.jpg', 'b.png', 'a.jpg']), ['a.jpg', 'a-2.jpg', 'b.png', 'a-3.jpg']);
});

test('computeResize keeps aspect ratio from width only', () => {
  const r = computeResize(4000, 3000, { mode: 'pixels', width: 800, height: null, keepRatio: true, fit: 'stretch' });
  assert.equal(r.cw, 800);
  assert.equal(r.ch, 600);
});

test('computeResize by percentage', () => {
  const r = computeResize(1000, 500, { mode: 'percent', percent: 50 });
  assert.deepEqual([r.cw, r.ch], [500, 250]);
});

test('computeResize cover crops to exact size', () => {
  const r = computeResize(2000, 1000, { mode: 'pixels', width: 1080, height: 1080, keepRatio: false, fit: 'cover' });
  assert.deepEqual([r.cw, r.ch], [1080, 1080]);
  assert.ok(r.dw >= 1080 && r.dh >= 1080);
});

test('computeResize contain pads to exact size', () => {
  const r = computeResize(2000, 1000, { mode: 'pixels', width: 500, height: 500, keepRatio: false, fit: 'contain' });
  assert.deepEqual([r.cw, r.ch, r.dw, r.dh, r.dy], [500, 500, 500, 250, 125]);
});

test('parseRange', () => {
  assert.deepEqual(parseRange('', 3), [1, 2, 3]);
  assert.deepEqual(parseRange('1-3, 5', 10), [1, 2, 3, 5]);
  assert.deepEqual(parseRange('8-12', 10), [8, 9, 10]);
  assert.deepEqual(parseRange('3-1', 5), [1, 2, 3]);
});

test('layoutImages side by side normalises height', () => {
  const L = layoutImages([{ w: 200, h: 100 }, { w: 100, h: 100 }], { dir: 'h', gap: 10, cols: 2 });
  assert.equal(L.height, 100);
  assert.equal(L.width, 200 + 10 + 100);
});

test('layoutImages grid', () => {
  const L = layoutImages(Array(4).fill({ w: 100, h: 100 }), { dir: 'g', gap: 0, cols: 2 });
  assert.deepEqual([L.width, L.height], [200, 200]);
});

test('rotatedSize', () => {
  assert.deepEqual(rotatedSize(400, 200, 90), { w: 200, h: 400 });
  assert.deepEqual(rotatedSize(400, 200, 180), { w: 400, h: 200 });
});

test('dataUrlToBlob detects mime from raw base64', async () => {
  const png1x1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const b = dataUrlToBlob(`data:image/png;base64,${png1x1}`);
  assert.equal(b.type, 'image/png');
  assert.equal(new Uint8Array(await b.arrayBuffer())[1], 0x50); // 'P' of \x89PNG
  assert.equal(dataUrlToBlob('/9j/4AAQ').type, 'image/jpeg');
});
