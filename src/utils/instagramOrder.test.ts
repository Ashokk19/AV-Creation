import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCartForInstagram,
  generateInstagramOrderMessage,
  getInstagramOrderUrls,
} from './instagramOrder';
import { CartItem } from '../types';

describe('instagramOrder', () => {
  const samplePricedItems: CartItem[] = [
    {
      product: {
        id: '1',
        title: 'Lotus Lamp',
        slug: 'lotus-lamp',
        category: 'tea-lights',
        categoryName: 'Tea Lights',
        shortDescription: 'Warm ambient glow lamp',
        storyDescription: 'Story',
        price: 350,
        imageUrl: '/sample1.jpg',
        specs: {
          material: 'PETG',
          printTimeHours: 9,
          layerResolution: '0.12mm',
          infillDensity: '18% Gyroid',
          dimensions: { widthMm: 140, depthMm: 140, heightMm: 190 },
          weightGrams: 180,
          nozzleDiameter: '0.4mm',
        },
        availableColors: [{ name: 'Warm Amber', hex: '#FFB84D', filamentType: 'Translucent PETG' }],
        isFeatured: true,
      } as any,
      quantity: 2,
      selectedColor: { name: 'Warm Amber', hex: '#FFB84D', filamentType: 'Translucent PETG' },
    },
    {
      product: {
        id: '2',
        title: 'Articulated Dragon',
        slug: 'articulated-dragon',
        category: 'clickers',
        categoryName: 'Clickers',
        shortDescription: 'Flexible dragon',
        storyDescription: 'Story',
        price: 500,
        imageUrl: '/sample2.jpg',
        specs: {
          material: 'PLA+',
          printTimeHours: 6,
          layerResolution: '0.16mm',
          infillDensity: '20% Gyroid',
          dimensions: { widthMm: 200, depthMm: 50, heightMm: 40 },
          weightGrams: 120,
          nozzleDiameter: '0.4mm',
        },
        availableColors: [{ name: 'Silk Gold', hex: '#D4AF37', filamentType: 'PLA+ Silk' }],
        isFeatured: false,
      } as any,
      quantity: 1,
      selectedColor: { name: 'Silk Gold', hex: '#D4AF37', filamentType: 'PLA+ Silk' },
    },
  ];

  test('validates valid cart with priced items', () => {
    const result = validateCartForInstagram(samplePricedItems);
    assert.equal(result.isValid, true);
    assert.equal(result.unpricedProducts.length, 0);
  });

  test('rejects empty cart', () => {
    const result = validateCartForInstagram([]);
    assert.equal(result.isValid, false);
    assert.match(result.errorMessage || '', /empty/i);
  });

  test('detects unpriced items and marks cart as invalid', () => {
    const mixedItems: CartItem[] = [
      ...samplePricedItems,
      {
        product: {
          ...samplePricedItems[0].product,
          id: '3',
          title: 'Custom Kinetic Sphere',
          price: null,
        },
        quantity: 1,
      },
    ];

    const result = validateCartForInstagram(mixedItems);
    assert.equal(result.isValid, false);
    assert.deepEqual(result.unpricedProducts, ['Custom Kinetic Sphere']);
  });

  test('formats structured Instagram message with username, items, totals, and color choices', () => {
    const message = generateInstagramOrderMessage(samplePricedItems);
    assert.match(message, /@avcreations963/);
    assert.match(message, /Lotus Lamp \(Warm Amber\) — Qty: 2 × ₹350 = ₹700/);
    assert.match(message, /Articulated Dragon \(Silk Gold\) — Qty: 1 × ₹500 = ₹500/);
    assert.match(message, /Total: ₹1,200/);
    assert.match(message, /Please confirm availability/);
  });

  test('generates correct Instagram direct URLs with username', () => {
    const urls = getInstagramOrderUrls();
    assert.equal(urls.directUrl, 'https://ig.me/m/avcreations963');
    assert.equal(urls.webDirectUrl, 'https://www.instagram.com/direct/t/avcreations963/');
    assert.equal(urls.profileUrl, 'https://www.instagram.com/avcreations963/');
  });
});
