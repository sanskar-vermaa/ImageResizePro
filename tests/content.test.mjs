// Content checks for SEO pages. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { TOOLS, CATEGORIES } from '../scripts/content/tools.mjs';

const slugs = new Set(TOOLS.map((t) => t.slug));

test('every slug is unique and URL-safe', () => {
  assert.equal(slugs.size, TOOLS.length);
  TOOLS.forEach((t) => assert.match(t.slug, /^[a-z0-9-]+$/, t.slug));
});

test('titles and meta descriptions fit in Google results', () => {
  TOOLS.forEach((t) => {
    assert.ok(t.title.length <= 70, `title too long (${t.title.length}): ${t.title}`);
    assert.ok(t.description.length >= 70 && t.description.length <= 170, `description length ${t.description.length}: ${t.slug}`);
  });
});

test('titles are unique', () => {
  assert.equal(new Set(TOOLS.map((t) => t.title)).size, TOOLS.length);
});

test('every page has steps, FAQ and a valid category', () => {
  const cats = new Set(CATEGORIES.map((c) => c.id));
  TOOLS.forEach((t) => {
    assert.ok(t.steps?.length >= 2, `${t.slug} needs steps`);
    assert.ok(t.faq?.length >= 1, `${t.slug} needs FAQ`);
    assert.ok(cats.has(t.category), `${t.slug} bad category`);
  });
});

test('every tool module exists', () => {
  TOOLS.forEach((t) => assert.ok(existsSync(new URL(`../assets/js/tools/${t.tool}.js`, import.meta.url)), `missing tool ${t.tool}`));
});
