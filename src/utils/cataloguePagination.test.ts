import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogueBookPlan } from './cataloguePagination';
import { CategoryRecord, ProductItem } from '../types';

function makeProduct(id: string, title: string, category: string, categoryName: string): ProductItem {
  return {
    id,
    slug: id,
    title,
    subtitle: `${categoryName} piece`,
    category,
    categoryName,
    categoryId: `cat-${category}`,
    functionType: 'decorative',
    shortDescription: 'Short desc',
    storyDescription: 'Story desc',
    price: 499,
    featured: false,
    trending: false,
    recentlyAdded: true,
    creationDate: '2025-01-01',
    status: 'active',
    image_path: `products/${id}.jpg`,
    primaryVisual: {
      accentGlow: '#9a6a3e',
      style: 'lotus-lamp',
      description: 'desc',
      aspectRatio: '4:3',
    },
    specs: {
      material: 'PLA+ Silk',
      layerResolution: '0.12mm',
      infillDensity: '15%',
      printTimeHours: 6,
      dimensions: { widthMm: 100, depthMm: 100, heightMm: 120 },
      weightGrams: 120,
      nozzleDiameter: '0.4mm',
    },
    availableColors: [{ name: 'Amber', hex: '#9a6a3e', filamentType: 'PLA+' }],
    customizable: true,
    tags: [],
  };
}

const sampleCategories: CategoryRecord[] = [
  { id: 'cat-tea-lights', name: 'Tea Lights', slug: 'tea-lights' },
  { id: 'cat-clickers', name: 'Clickers', slug: 'clickers' },
  { id: 'cat-pokemon', name: 'Pokemon', slug: 'pokemon' },
];

test('handles 0 products gracefully with Cover + Editorial Index spreads', () => {
  const plan = buildCatalogueBookPlan(sampleCategories, []);
  assert.equal(plan.totalSpreads, 2);
  assert.equal(plan.totalPlates, 0);
  assert.equal(plan.firstProductSpreadIndex, null);
  assert.equal(plan.spreads[0].type, 'cover');
  assert.equal(plan.spreads[1].type, 'index');
  assert.equal(plan.categoryEntries.length, 0);
});

test('handles fewer than 9 products (< 9) cleanly with chapter grouping', () => {
  const products = [
    makeProduct('p1', 'Lotus Tea Light', 'tea-lights', 'Tea Lights'),
    makeProduct('p2', 'Pika Keycap', 'pokemon', 'Pokemon'),
    makeProduct('p3', 'Spiral Tea Light', 'tea-lights', 'Tea Lights'),
  ];
  const plan = buildCatalogueBookPlan(sampleCategories, products);
  assert.equal(plan.totalSpreads, 5); // cover + index + 3 products
  assert.equal(plan.totalPlates, 3);
  assert.equal(plan.firstProductSpreadIndex, 2);
  // Category grouping puts Tea Lights together first, then Pokemon
  assert.equal(plan.spreads[2].product?.id, 'p1');
  assert.equal(plan.spreads[3].product?.id, 'p3');
  assert.equal(plan.spreads[4].product?.id, 'p2');
  assert.equal(plan.categoryEntries.length, 2);
  assert.equal(plan.categoryEntries[0].slug, 'tea-lights');
  assert.equal(plan.categoryEntries[0].startSpreadIndex, 2);
  assert.equal(plan.categoryEntries[1].slug, 'pokemon');
  assert.equal(plan.categoryEntries[1].startSpreadIndex, 4);
});

test('handles exactly 9 products without hardcoding', () => {
  const products = Array.from({ length: 9 }, (_, i) =>
    makeProduct(`p${i + 1}`, `Item ${i + 1}`, i < 5 ? 'tea-lights' : 'clickers', i < 5 ? 'Tea Lights' : 'Clickers')
  );
  const plan = buildCatalogueBookPlan(sampleCategories, products);
  assert.equal(plan.totalSpreads, 11);
  assert.equal(plan.totalPlates, 9);
  assert.equal(plan.categoryEntries[1].startSpreadIndex, 7);
});

test('handles more than 9 products (> 9) seamlessly across arbitrary catalog size', () => {
  const products = Array.from({ length: 16 }, (_, i) =>
    makeProduct(`p${i + 1}`, `Creation ${i + 1}`, 'clickers', 'Clickers')
  );
  const plan = buildCatalogueBookPlan(sampleCategories, products);
  assert.equal(plan.totalSpreads, 18);
  assert.equal(plan.totalPlates, 16);
  assert.equal(plan.spreads[17].plateNumber, 16);
});
