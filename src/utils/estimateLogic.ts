import { FilamentMaterial, ProductCategory } from '../types';

export interface PrintEstimateParams {
  category: ProductCategory | 'other';
  widthMm: number;
  depthMm: number;
  heightMm: number;
  layerHeightMm: number; // 0.12, 0.16, 0.20
  infillPercent: number; // 15 to 40
  material: FilamentMaterial | 'Studio Recommendation';
  quantity: number;
}

export interface PrintEstimateResult {
  estimatedPrintHours: number;
  estimatedWeightGrams: number;
  totalLayerCount: number;
  difficultyRating: 'Standard' | 'Intricate' | 'Master Grade';
  recommendedMaterial: FilamentMaterial;
  suggestedTurnaroundDays: number;
}

/**
 * Calculates a realistic 3D printing technical estimate based on geometric bounding box
 * and additive manufacturing physics.
 */
export function calculatePrintEstimate(params: PrintEstimateParams): PrintEstimateResult {
  const { widthMm, depthMm, heightMm, layerHeightMm, infillPercent, quantity } = params;

  // Total layer count = height / layer height
  const safeLayerHeight = Math.max(0.08, Math.min(0.28, layerHeightMm || 0.16));
  const totalLayers = Math.round(Math.max(10, heightMm) / safeLayerHeight);

  // Volume approximation of bounding box in cm^3 (with infill and shell factor)
  const boundingVolumeCm3 = (Math.max(10, widthMm) * Math.max(10, depthMm) * Math.max(10, heightMm)) / 1000;
  
  // Real 3D prints are mostly hollow / shell based (outer perimeter ~20% volume + internal infill)
  const solidRatio = 0.15 + (Math.max(10, Math.min(60, infillPercent)) / 100) * 0.25;
  const printVolumeCm3 = boundingVolumeCm3 * solidRatio;

  // PLA/PETG density is approx 1.25 g/cm^3
  const singleWeightGrams = Math.max(15, Math.round(printVolumeCm3 * 1.25));
  const totalWeightGrams = singleWeightGrams * Math.max(1, quantity);

  // Print speed approximation: ~12-18 grams/hour on modern tuned coreXY printers
  const gramsPerHour = safeLayerHeight <= 0.12 ? 10 : 16;
  const singleHours = Math.max(1.5, Math.round((singleWeightGrams / gramsPerHour) * 10) / 10);
  const totalPrintHours = Math.round(singleHours * Math.max(1, quantity) * 10) / 10;

  // Assess difficulty rating based on layer height and hours
  let difficultyRating: 'Standard' | 'Intricate' | 'Master Grade' = 'Standard';
  if (safeLayerHeight <= 0.12 || singleHours > 16 || params.category === 'ambient-lighting' || params.category === 'articulated-collectible') {
    difficultyRating = 'Intricate';
  }
  if (safeLayerHeight <= 0.10 && singleHours > 24) {
    difficultyRating = 'Master Grade';
  }

  // Recommended material
  let recommendedMaterial: FilamentMaterial = 'PLA+ Silk';
  if (params.category === 'ambient-lighting') {
    recommendedMaterial = 'Translucent PETG';
  } else if (params.category === 'home-living') {
    recommendedMaterial = 'Matte PLA';
  } else if (params.category === 'miniature-worlds') {
    recommendedMaterial = 'Resin High-Detail';
  }

  // Turnaround days based on hours and queue
  const suggestedTurnaroundDays = totalPrintHours <= 10 ? 3 : totalPrintHours <= 30 ? 5 : 8;

  return {
    estimatedPrintHours: totalPrintHours,
    estimatedWeightGrams: totalWeightGrams,
    totalLayerCount: totalLayers,
    difficultyRating,
    recommendedMaterial: params.material === 'Studio Recommendation' ? recommendedMaterial : params.material,
    suggestedTurnaroundDays,
  };
}
