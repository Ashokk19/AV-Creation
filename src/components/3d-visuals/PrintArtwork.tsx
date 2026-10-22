import React, { useId, useState } from 'react';
import { ProductItem, ColorVariant } from '../../types';
import { getProductImageUrl } from '../../lib/supabase';

interface PrintArtworkProps {
  product: ProductItem;
  activeColor?: ColorVariant;
  angle?: 'primary' | 'detail' | 'sliced';
  className?: string;
  isHovered?: boolean;
  priority?: boolean;
}

export const PrintArtwork: React.FC<PrintArtworkProps> = ({
  product,
  activeColor,
  angle = 'primary',
  className = '',
  isHovered = false,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const [imageError, setImageError] = useState(false);
  const colorHex = activeColor?.hex || product.availableColors[0]?.hex || product.primaryVisual.accentGlow;
  const isLighting = product.category === 'ambient-lighting' || product.category === 'tea-lights';
  const isArticulated = product.category === 'articulated-collectible' || product.category === 'clickers';

  const imageUrl = product.imageUrl || getProductImageUrl(product.image_path);
  const hasRealImage = Boolean(imageUrl && !imageError && imageUrl.length > 5);

  // Render authentic geometric SVG visual representation based on product style
  const renderGeometry = () => {
    switch (product.primaryVisual.style) {
      case 'lotus-lamp':
        return (
          <g transform="translate(200, 160)">
            {/* Ambient internal radiant glow core */}
            <circle
              cx="0"
              cy="-10"
              r={isHovered ? 85 : 70}
              fill="url(#lampCoreGlow)"
              className="transition-all duration-700 ease-out"
              opacity={0.85}
            />

            {/* Base platform */}
            <path
              d="M -70 80 C -50 95 50 95 70 80 L 60 92 C 40 102 -40 102 -60 92 Z"
              fill="#18181B"
              stroke="#27272A"
              strokeWidth="1.5"
            />
            {/* Brass base accent ring */}
            <ellipse cx="0" cy="80" rx="68" ry="14" fill="#202024" stroke="#E7A96B" strokeWidth="0.8" opacity="0.6" />

            {/* Back petals */}
            {[-45, -22, 0, 22, 45].map((angleDeg, i) => (
              <g key={`back-petal-${i}`} transform={`rotate(${angleDeg})`}>
                <path
                  d="M 0 60 C -45 0 -40 -90 0 -130 C 40 -90 45 0 0 60 Z"
                  fill={colorHex}
                  fillOpacity="0.45"
                  stroke={colorHex}
                  strokeWidth="1"
                  strokeOpacity="0.7"
                />
              </g>
            ))}

            {/* Layer lines simulation across petals */}
            {[-70, -50, -30, -10, 10, 30, 50].map((yOffset, i) => (
              <path
                key={`layer-line-${i}`}
                d={`M -50 ${yOffset} Q 0 ${yOffset - 15} 50 ${yOffset}`}
                stroke="#FFFFFF"
                strokeWidth="0.5"
                strokeOpacity={isHovered ? "0.35" : "0.2"}
                fill="none"
              />
            ))}

            {/* Front spiral petals */}
            {[-30, -10, 15, 35].map((angleDeg, i) => (
              <g key={`front-petal-${i}`} transform={`rotate(${angleDeg})`}>
                <path
                  d="M 0 65 C -35 15 -35 -70 0 -115 C 35 -70 35 15 0 65 Z"
                  fill="url(#petallightGlow)"
                  stroke={colorHex}
                  strokeWidth="1.2"
                  filter="url(#subtleBloom)"
                />
              </g>
            ))}

            {/* Central spiraling core filament */}
            <path
              d="M 0 60 Q -25 -20 0 -90 Q 25 -20 0 60"
              fill="none"
              stroke="#FFF5E5"
              strokeWidth="2.5"
              filter="url(#highBloom)"
            />
          </g>
        );

      case 'articulated-dragon':
        return (
          <g transform="translate(200, 150)">
            {/* Dragon body serpentine curve */}
            <path
              d="M -130 50 C -90 80 -40 30 -10 60 C 20 90 70 50 110 30 C 135 15 140 -20 120 -50 C 95 -80 60 -60 35 -40 C 0 -15 -40 -40 -80 -25"
              fill="none"
              stroke={colorHex}
              strokeWidth={isHovered ? 26 : 24}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            {/* Articulated segment separations */}
            {Array.from({ length: 18 }).map((_, i) => {
              const t = i / 18;
              const angle = t * Math.PI * 2.5;
              const x = -120 + i * 13;
              const y = 35 + Math.sin(angle) * 28;
              return (
                <ellipse
                  key={`seg-${i}`}
                  cx={x}
                  cy={y}
                  rx="7"
                  ry="12"
                  transform={`rotate(${Math.cos(angle) * 45} ${x} ${y})`}
                  fill="url(#silkSheen)"
                  stroke="#1E1E22"
                  strokeWidth="1.2"
                />
              );
            })}
            {/* Dragon horned head */}
            <g transform="translate(125, -45) rotate(-25)">
              <polygon points="0,-18 24,-5 20,12 -5,10 -15,-5" fill={colorHex} stroke="#FFE082" strokeWidth="1" />
              {/* Dual horns */}
              <path d="M 5 -15 Q 18 -35 28 -42" stroke="#F6D365" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M -5 -15 Q 0 -35 5 -44" stroke="#F6D365" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Piercing eye */}
              <circle cx="10" cy="-2" r="2.2" fill="#FFFFFF" filter="url(#highBloom)" />
              {/* Whiskers */}
              <path d="M 22 2 Q 40 10 50 0" stroke="#FFE082" strokeWidth="1" fill="none" opacity="0.8" />
            </g>
            {/* Claws */}
            <path d="M -70 65 L -80 85 M -70 65 L -72 88 M -70 65 L -62 84" stroke={colorHex} strokeWidth="2" />
            <path d="M 40 68 L 32 86 M 40 68 L 40 90 M 40 68 L 48 85" stroke={colorHex} strokeWidth="2" />
          </g>
        );

      case 'lithophane-cylinder':
        return (
          <g transform="translate(200, 150)">
            {/* Warm core lamp glow */}
            <ellipse cx="0" cy="0" rx="65" ry="90" fill="url(#lampCoreGlow)" opacity="0.9" />

            {/* Cylinder silhouette */}
            <rect x="-65" y="-95" width="130" height="190" rx="6" fill="#1C1C1E" stroke="#333" strokeWidth="1" />
            <rect x="-63" y="-93" width="126" height="186" rx="4" fill="url(#petallightGlow)" opacity="0.85" />

            {/* Topographic mountain ridges etched into lithophane */}
            <path
              d="M -63 40 L -45 10 L -25 25 L 0 -15 L 25 15 L 45 -5 L 63 20 L 63 93 L -63 93 Z"
              fill="#24211D"
              opacity="0.8"
            />
            <path
              d="M -63 15 L -35 -20 L -10 5 L 15 -45 L 35 -10 L 63 -25 L 63 93 L -63 93 Z"
              fill="#181614"
              opacity="0.6"
            />
            <path
              d="M -63 -20 L -25 -65 L 10 -35 L 40 -80 L 63 -50 L 63 93 L -63 93 Z"
              fill="#100E0D"
              opacity="0.5"
            />

            {/* Fine layer striations (0.10mm litho resolution) */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={`litho-layer-${i}`}
                x1="-63"
                y1={-90 + i * 10}
                x2="63"
                y2={-90 + i * 10}
                stroke="#FFFFFF"
                strokeWidth="0.4"
                strokeOpacity="0.25"
              />
            ))}

            {/* Minimalist walnut wood base */}
            <path d="M -75 95 L 75 95 L 70 108 L -70 108 Z" fill="#2C1B10" stroke="#3D2617" strokeWidth="1" />
            <ellipse cx="0" cy="95" rx="75" ry="10" fill="#382315" stroke="#4A2E1C" strokeWidth="1" />
          </g>
        );

      case 'voronoi-planter':
        return (
          <g transform="translate(200, 160)">
            {/* Green succulent plant inside */}
            <g transform="translate(0, -45)">
              {[-60, -35, -10, 10, 35, 60].map((deg, i) => (
                <path
                  key={`succulent-${i}`}
                  d="M 0 0 C -15 -25 0 -50 0 -55 C 0 -50 15 -25 0 0"
                  fill="#4E7C59"
                  stroke="#2F5238"
                  strokeWidth="1.2"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="-20" r="14" fill="#3D6846" />
            </g>

            {/* Faceted planter body */}
            <path
              d="M -70 -20 L 70 -20 L 52 75 L -52 75 Z"
              fill={colorHex}
              stroke="#1F2022"
              strokeWidth="2"
            />

            {/* Voronoi cellular cutout web */}
            {[
              { d: 'M -45 -10 L -25 -12 L -20 8 L -40 10 Z' },
              { d: 'M -10 -14 L 15 -14 L 18 10 L -12 12 Z' },
              { d: 'M 25 -12 L 48 -10 L 42 12 L 22 10 Z' },
              { d: 'M -35 22 L -15 24 L -20 50 L -38 45 Z' },
              { d: 'M -5 24 L 20 23 L 15 52 L -8 54 Z' },
              { d: 'M 28 22 L 42 20 L 34 46 L 22 50 Z' },
            ].map((cell, i) => (
              <path
                key={`voronoi-${i}`}
                d={cell.d}
                fill="#18181B"
                stroke="#2B2D31"
                strokeWidth="1.5"
                className="transition-opacity duration-300"
                opacity={isHovered ? 0.95 : 0.8}
              />
            ))}

            {/* Twist lock drainage coaster */}
            <path d="M -58 78 L 58 78 L 54 88 L -54 88 Z" fill="#1C1D1F" stroke="#2D3035" strokeWidth="1" />
          </g>
        );

      case 'gothic-citadel':
        return (
          <g transform="translate(200, 160)">
            {/* Dramatic rim shadow */}
            <rect x="-85" y="-120" width="170" height="210" fill="none" />

            {/* Central high tower spire */}
            <polygon points="0,-140 -20,-70 20,-70" fill={colorHex} stroke="#B0B6BE" strokeWidth="0.8" />
            <rect x="-22" y="-70" width="44" height="120" fill={colorHex} stroke="#3E424B" strokeWidth="1.2" />

            {/* Twin side towers */}
            <polygon points="-55,-95 -70,-50 -40,-50" fill={colorHex} stroke="#9CA3AF" strokeWidth="0.8" />
            <rect x="-70" y="-50" width="30" height="100" fill={colorHex} stroke="#373B43" strokeWidth="1" />

            <polygon points="55,-95 40,-50 70,-50" fill={colorHex} stroke="#9CA3AF" strokeWidth="0.8" />
            <rect x="40" y="-50" width="30" height="100" fill={colorHex} stroke="#373B43" strokeWidth="1" />

            {/* Gothic pointed arch windows */}
            {[-55, 0, 55].map((xPos, i) => (
              <g key={`arch-${i}`} transform={`translate(${xPos}, -10)`}>
                <path d="M -8 15 L -8 -5 Q 0 -18 8 -5 L 8 15 Z" fill="#121316" stroke="#4B5563" strokeWidth="1" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#4B5563" strokeWidth="0.8" />
              </g>
            ))}

            {/* Flying buttresses (overhang cantilever arches) */}
            <path d="M -70 -20 Q -85 -5 -80 35" fill="none" stroke={colorHex} strokeWidth="3" />
            <path d="M 70 -20 Q 85 -5 80 35" fill="none" stroke={colorHex} strokeWidth="3" />

            {/* Stone parapets & base stairs */}
            <rect x="-90" y="50" width="180" height="22" fill="#25282F" stroke="#3F4450" strokeWidth="1" />
            <rect x="-96" y="72" width="192" height="10" fill="#1C1E23" />
          </g>
        );

      case 'moon-sphere':
        return (
          <g transform="translate(200, 150)">
            {/* Soft lunar atmosphere halo */}
            <circle cx="0" cy="0" r={isHovered ? 88 : 80} fill="url(#lunarHalo)" opacity="0.6" className="transition-all duration-700" />

            {/* Moon sphere body */}
            <circle cx="0" cy="0" r="76" fill="url(#petallightGlow)" stroke="#E5E7EB" strokeWidth="0.8" filter="url(#subtleBloom)" />

            {/* Embossed lunar craters & maria */}
            <circle cx="-25" cy="-20" r="18" fill="#1F242D" opacity="0.4" />
            <circle cx="28" cy="15" r="24" fill="#1F242D" opacity="0.35" />
            <circle cx="-10" cy="35" r="14" fill="#1F242D" opacity="0.45" />
            <circle cx="20" cy="-35" r="10" fill="#1F242D" opacity="0.3" />

            {/* Micro crater rings */}
            {[
              { cx: -25, cy: -20, r: 18 },
              { cx: 28, cy: 15, r: 24 },
              { cx: -38, cy: 12, r: 8 },
              { cx: 8, cy: -10, r: 6 },
              { cx: 45, cy: -15, r: 7 },
            ].map((c, i) => (
              <circle
                key={`crater-${i}`}
                cx={c.cx}
                cy={c.cy}
                r={c.r}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.6"
                strokeOpacity="0.4"
              />
            ))}

            {/* Geometric tripod wooden stand */}
            <path d="M -45 55 L -60 100 M 45 55 L 60 100 M 0 65 L 0 105" stroke="#8D6E63" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="0" cy="65" r="4" fill="#4E342E" />
          </g>
        );

      default:
        // Generic sculptural parametric form
        return (
          <g transform="translate(200, 150)">
            <ellipse cx="0" cy="0" rx="70" ry="70" fill={colorHex} fillOpacity="0.2" stroke={colorHex} strokeWidth="1.5" />
            {[-40, -20, 0, 20, 40].map((step, idx) => (
              <path
                key={`slice-${idx}`}
                d={`M -60 ${step} Q 0 ${step - 30} 60 ${step}`}
                stroke={colorHex}
                strokeWidth="1.8"
                fill="none"
              />
            ))}
            <circle cx="0" cy="0" r="25" fill="url(#lampCoreGlow)" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#18181A] to-[#0E0E10] flex items-center justify-center select-none ${className}`}
    >
      {/* Dynamic studio background rim vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 60% 35%, ${colorHex}33 0%, transparent 65%)`,
        }}
      />

      {/* Layer Lines Texture Background Grid (Macro 3D printing aesthetic) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 255, 255, 0.08) 3px, rgba(255, 255, 255, 0.08) 4px)',
        }}
      />

      {/* Sliced Toolpath Preview Overlay (when angle === 'sliced' or on hover if requested) */}
      {angle === 'sliced' && (
        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-[#E7A96B]/40 rounded text-[11px] font-mono text-[#E7A96B] tracking-wider">
          LAYER 842 / 1250 · 0.12mm
        </div>
      )}

      {/* Real Product Photography or Vector Studio Render */}
      {hasRealImage ? (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            onError={() => setImageError(true)}
            loading={priority ? 'eager' : 'lazy'}
          />
          {/* Subtle bottom shadow vignette for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        <svg
          viewBox="0 0 400 300"
          className={`w-full h-full transition-transform duration-500 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Radial internal light source */}
            <radialGradient id="lampCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF2D6" stopOpacity="1" />
              <stop offset="35%" stopColor={colorHex} stopOpacity="0.8" />
              <stop offset="70%" stopColor={colorHex} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
            </radialGradient>

            {/* Translucent petal gradient */}
            <linearGradient id="petallightGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="40%" stopColor={colorHex} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1C1B1A" stopOpacity="0.95" />
            </linearGradient>

            {/* Silk filament specular reflection */}
            <linearGradient id="silkSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.9" />
              <stop offset="50%" stopColor={colorHex} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#302008" stopOpacity="0.9" />
            </linearGradient>

            {/* Lunar atmosphere halo */}
            <radialGradient id="lunarHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="65%" stopColor={colorHex} stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Bloom filters */}
            <filter id="subtleBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="highBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient shadow underneath */}
          <ellipse cx="200" cy="260" rx="90" ry="14" fill="#050505" opacity="0.8" />

          {/* Render geometry */}
          {renderGeometry()}

          {/* Toolpath slice lines if 'sliced' mode */}
          {angle === 'sliced' && (
            <g opacity="0.6">
              {Array.from({ length: 30 }).map((_, i) => (
                <line
                  key={`slice-grid-${i}`}
                  x1="40"
                  y1={30 + i * 8}
                  x2="360"
                  y2={30 + i * 8}
                  stroke="#E7A96B"
                  strokeWidth="0.5"
                  strokeDasharray="4 2"
                />
              ))}
            </g>
          )}
        </svg>
      )}

      {/* Macro Studio Watermark / Calibration mark */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[9px] uppercase tracking-widest text-[#737373] font-mono opacity-60">
        AV·0{product.specs.layerResolution.slice(0, 4)}mm
      </div>
    </div>
  );
};
