import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProducts, getCategoryCarousels } from './filterLogic';
import { calculatePrintEstimate } from './estimateLogic';
import { ProductItem, CategoryRecord } from '../types';

const mockProducts: ProductItem[] = [
  {
    id: 'lamp-1',
    slug: 'lotus-spiral-lamp',
    title: 'Lotus Spiral Ambient Lamp',
    subtitle: 'Parametric spiral ambient table lamp',
    category: 'tea-lights',
    categoryName: 'Tea Lights',
    categoryId: 'cat-1',
    functionType: 'functional',
    shortDescription: 'Glowing lotus petal geometry',
    storyDescription: 'Story description for lamp',
    featured: true,
    trending: true,
    recentlyAdded: false,
    creationDate: '2026-03-01',
    status: 'active',
    image_path: 'products/lamp.webp',
    primaryVisual: {
      accentGlow: '#E7A96B',
      style: 'spiral-lotus',
      description: 'Amber glowing spiral',
      aspectRatio: '16:9',
    },
    specs: {
      material: 'Translucent PETG',
      layerResolution: '0.12 mm',
      infillDensity: '15% Spiral',
      printTimeHours: 18.5,
      dimensions: { widthMm: 160, depthMm: 160, heightMm: 220 },
      weightGrams: 280,
      nozzleDiameter: '0.4 mm',
    },
    availableColors: [{ name: 'Amber Glow', hex: '#E7A96B', filamentType: 'PETG' }],
    customizable: true,
    tags: ['lighting', 'lotus', 'glow', 'parametric'],
  },
  {
    id: 'dragon-1',
    slug: 'imperial-flexi-dragon',
    title: 'Imperial Flexi Dragon',
    subtitle: 'Kinetic articulated dragon',
    category: 'clickers',
    categoryName: 'Clickers',
    categoryId: 'cat-2',
    functionType: 'decorative',
    shortDescription: 'Multi-jointed flexi print',
    storyDescription: 'Story for dragon',
    featured: false,
    trending: true,
    recentlyAdded: true,
    creationDate: '2026-03-10',
    status: 'active',
    image_path: 'products/dragon.webp',
    primaryVisual: {
      accentGlow: '#B8860B',
      style: 'flexi-dragon',
      description: 'Silk bronze dragon',
      aspectRatio: '4:3',
    },
    specs: {
      material: 'PLA+ Silk',
      layerResolution: '0.16 mm',
      infillDensity: '20% Gyroid',
      printTimeHours: 14.0,
      dimensions: { widthMm: 80, depthMm: 450, heightMm: 55 },
      weightGrams: 195,
      nozzleDiameter: '0.4 mm',
    },
    availableColors: [{ name: 'Silk Gold', hex: '#D4AF37', filamentType: 'Silk PLA' }],
    customizable: true,
    tags: ['dragon', 'articulated', 'toy', 'fidget'],
  },
];

const mockCategories: CategoryRecord[] = [
  { id: 'cat-1', name: 'Tea Lights', slug: 'tea-lights', product_count: 1 },
  { id: 'cat-2', name: 'Clickers', slug: 'clickers', product_count: 1 },
  { id: 'cat-3', name: 'Pokemon', slug: 'pokemon', product_count: 0 },
  { id: 'cat-4', name: 'Wall Decors', slug: 'wall-decors', product_count: 0 },
];

test('filterProducts filters by category correctly', () => {
  const result = filterProducts(mockProducts, { category: 'tea-lights' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'lamp-1');
});

test('filterProducts filters by functionType correctly', () => {
  const functionalItems = filterProducts(mockProducts, { functionType: 'functional' });
  assert.equal(functionalItems.length, 1);
  const decorativeItems = filterProducts(mockProducts, { functionType: 'decorative' });
  assert.equal(decorativeItems.length, 1);
});

test('getCategoryCarousels includes all default categories even when empty', () => {
  const rows = getCategoryCarousels(mockCategories, mockProducts);
  // Should have Featured row + 4 categories = 5 rows
  assert.ok(rows.length >= 4);
  const pokemonRow = rows.find((r) => r.id === 'pokemon');
  assert.ok(pokemonRow, 'Pokemon category row must exist');
  assert.equal(pokemonRow.items.length, 0, 'Pokemon has 0 items');
});

test('calculatePrintEstimate produces valid physical metrics', () => {
  const estimate = calculatePrintEstimate({
    category: 'ambient-lighting' as any,
    widthMm: 150,
    depthMm: 150,
    heightMm: 200,
    layerHeightMm: 0.16,
    infillPercent: 20,
    material: 'Studio Recommendation',
    quantity: 1,
  });

  assert.ok(estimate.totalLayerCount > 1000);
  assert.ok(estimate.estimatedPrintHours > 5);
  assert.ok(estimate.estimatedWeightGrams > 50);
});
