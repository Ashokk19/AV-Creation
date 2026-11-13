import React, { useRef } from 'react';
import { HeroFrameSettings, DEFAULT_HERO_FRAME_SETTINGS } from '../services/settingsService';
import { formatPriceINR } from '../lib/config';

export interface HeroFrameProps {
  image: string;
  title?: string;
  category?: string;
  price?: number | null;
  options?: HeroFrameSettings;
  isLogo?: boolean;
  className?: string;
  interactiveFocalPoint?: boolean;
  onFocalPointChange?: (point: { x: number; y: number }) => void;
  priority?: boolean;
}

export const HeroFrame: React.FC<HeroFrameProps> = ({
  image,
  title,
  category,
  price,
  options = DEFAULT_HERO_FRAME_SETTINGS,
  isLogo = false,
  className = '',
  interactiveFocalPoint = false,
  onFocalPointChange,
  priority = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback image if empty
  const displayImage = image || '/assets/aistudio/AV_Creations_Logo_with_3D_Printer_Icon_29dbcfaa.png';

  // Effective fit: if 'auto', logo uses 'contain', wide banners use 'cover'
  const effectiveFit = options.fit === 'auto' ? (isLogo ? 'contain' : 'cover') : options.fit;

  // Aspect ratio class mapping
  const ratioClasses: Record<string, string> = {
    '4/5': 'aspect-[4/5]',
    '1/1': 'aspect-square',
    '3/4': 'aspect-[3/4]',
    '16/9': 'aspect-video',
    auto: '',
  };

  const ratioClass = ratioClasses[options.aspectRatio] || 'aspect-[4/5]';

  // Style CSS Variables
  const cssVariables = {
    '--frame-radius': `${options.radius}px`,
    '--frame-padding': `${options.padding}px`,
    '--frame-blur': `${options.blur}px`,
    '--frame-ratio': options.aspectRatio === 'auto' ? 'auto' : options.aspectRatio.replace('/', ' / '),
  } as React.CSSProperties;

  // Focal point click handler for interactive picker in admin preview
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveFocalPoint || !onFocalPointChange || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    onFocalPointChange({ x, y });
  };

  // Focal point position for CSS object-position
  const focalPointStyle = `${options.focalPoint?.x ?? 50}% ${options.focalPoint?.y ?? 50}%`;

  // Info Tag Label formatting (e.g. "POKEMON  ₹400" or title)
  const infoTagContent = (() => {
    const parts: string[] = [];
    if (category) parts.push(category.toUpperCase());
    if (price !== undefined && price !== null) {
      parts.push(formatPriceINR(price));
    } else if (title && !category) {
      parts.push(title);
    }
    return parts.length > 0 ? parts.join('  ·  ') : null;
  })();

  // -------------------------------------------------------------
  // STYLE VARIANT 1: FULL BLEED (Prior behavior preserved)
  // -------------------------------------------------------------
  if (options.style === 'bleed') {
    return (
      <div
        ref={containerRef}
        style={cssVariables}
        className={`relative w-full h-full overflow-hidden select-none ${className}`}
        onClick={handleImageClick}
      >
        <img
          src={displayImage}
          alt={title || category || 'AV Creations Studio'}
          style={{ objectPosition: focalPointStyle }}
          className="w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
        />
        {/* Left and Bottom Vignette Fade into Dark Studio Background */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#101010] via-transparent to-transparent w-full" />
        <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none bg-gradient-to-t from-[#101010] to-transparent" />

        {/* Optional Info Tag */}
        {options.infoTag && infoTagContent && (
          <div className="absolute bottom-6 left-6 z-20 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-xs font-mono text-[#F5F3EF] shadow-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E7A96B]" />
            <span className="font-semibold">{infoTagContent}</span>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STYLE VARIANT 2: BORDERLESS / FLOATING (Drop-shadow only, no box)
  // -------------------------------------------------------------
  if (options.style === 'floating') {
    return (
      <div
        ref={containerRef}
        style={cssVariables}
        className={`relative w-full max-w-[540px] mx-auto flex items-center justify-center p-4 select-none ${ratioClass} ${className}`}
        onClick={handleImageClick}
      >
        {/* Subtle ambient aura behind floating image */}
        <div className="absolute inset-4 bg-[#E7A96B]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <img
            src={displayImage}
            alt={title || category || 'AV Creations Showcase'}
            style={{
              objectPosition: focalPointStyle,
              borderRadius: 'var(--frame-radius)',
            }}
            className={`w-full h-full ${
              effectiveFit === 'cover' ? 'object-cover' : 'object-contain'
            } transition-transform duration-500 hover:scale-[1.02] ${
              options.shadow ? 'drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]' : ''
            }`}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>

        {/* Optional Info Tag */}
        {options.infoTag && infoTagContent && (
          <div className="absolute bottom-4 left-6 z-20 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-[#F5F3EF] shadow-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E7A96B]" />
            <span className="font-semibold">{infoTagContent}</span>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STYLE VARIANT 3: POLAROID / GALLERY (White/cream gallery matte border)
  // -------------------------------------------------------------
  if (options.style === 'polaroid') {
    return (
      <div
        ref={containerRef}
        style={cssVariables}
        className={`relative w-full max-w-[500px] mx-auto p-4 sm:p-5 pb-8 sm:pb-10 bg-[#F4F3EF] text-[#141416] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-[#E5E4E0] select-none ${className}`}
        onClick={handleImageClick}
      >
        <div className={`relative w-full overflow-hidden rounded bg-[#101012] border border-black/10 ${ratioClass}`}>
          <img
            src={displayImage}
            alt={title || category || 'Studio Gallery'}
            style={{ objectPosition: focalPointStyle }}
            className={`w-full h-full ${effectiveFit === 'cover' ? 'object-cover' : 'object-contain'}`}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs font-mono text-[#444] px-1">
          <span className="font-bold text-[#141416] tracking-wider uppercase">
            {title || category || 'AV Creations Studio'}
          </span>
          {price !== undefined && price !== null && (
            <span className="font-bold text-[#B36B2E]">{formatPriceINR(price)}</span>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STYLE VARIANT 4 (DEFAULT): FRAMED CARD
  // Dark panel background (#17171a), 1px border (#2a2a2f), soft deep shadow,
  // Layer 1 blurred scaled copy, Layer 2 contained foreground image with padding.
  // -------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      style={{
        ...cssVariables,
        borderRadius: 'var(--frame-radius)',
      }}
      className={`group relative w-full max-w-[540px] mx-auto overflow-hidden border border-[#2a2a2f] bg-[#17171a] select-none transition-all duration-300 ${ratioClass} ${
        options.shadow ? 'shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]' : ''
      } ${className}`}
      onClick={handleImageClick}
    >
      {/* Container Custom Border Radius via CSS variable */}
      <style>{`
        .hero-frame-container-${options.radius} {
          border-radius: var(--frame-radius);
        }
      `}</style>

      {/* LAYER 1: BACKDROP */}
      {options.backdrop === 'blur' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={displayImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{
              filter: `blur(var(--frame-blur)) brightness(0.55) saturate(1.2)`,
              transform: 'scale(1.18)',
              objectPosition: focalPointStyle,
            }}
            className="w-full h-full object-cover select-none"
          />
          {/* Subtle dark tint overlay to guarantee contrast */}
          <div className="absolute inset-0 bg-black/40 backdrop-contrast-125" />
        </div>
      )}

      {options.backdrop === 'glow' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(231,169,107,0.22)_0%,rgba(20,20,24,0.9)_70%,#17171a_100%)]" />
      )}

      {options.backdrop === 'solid' && (
        <div className="absolute inset-0 pointer-events-none bg-[#17171a]" />
      )}

      {/* LAYER 2: FOREGROUND IMAGE (contained or covered with padding & corner radius) */}
      <div
        style={{ padding: 'var(--frame-padding)' }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <img
          src={displayImage}
          alt={title || category || 'AV Creations 3D Studio'}
          style={{
            objectPosition: focalPointStyle,
            borderRadius: `calc(var(--frame-radius) - 6px)`,
          }}
          className={`w-full h-full ${
            effectiveFit === 'cover' ? 'object-cover' : 'object-contain'
          } transition-transform duration-500 group-hover:scale-[1.02] ${
            options.shadow ? 'drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]' : ''
          }`}
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Interactive Focal Point Target Indicator (in Admin Live Preview) */}
        {interactiveFocalPoint && (
          <div
            style={{
              left: `${options.focalPoint?.x ?? 50}%`,
              top: `${options.focalPoint?.y ?? 50}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
            title={`Focal point: ${options.focalPoint?.x ?? 50}%, ${options.focalPoint?.y ?? 50}%`}
          >
            <div className="w-6 h-6 rounded-full border-2 border-[#E7A96B] bg-[#E7A96B]/30 animate-ping absolute" />
            <div className="w-4 h-4 rounded-full border-2 border-white bg-[#E7A96B] shadow-md relative flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-black" />
            </div>
          </div>
        )}
      </div>

      {/* OPTIONAL CORNER BRACKETS (4 small L-shaped corners, 22px, 2px border, inset 14px) */}
      {options.cornerBrackets && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Top-Left */}
          <span
            className="absolute top-[14px] left-[14px] w-[22px] h-[22px] border-t-2 border-l-2 border-[#E7A96B]"
            aria-hidden="true"
          />
          {/* Top-Right */}
          <span
            className="absolute top-[14px] right-[14px] w-[22px] h-[22px] border-t-2 border-r-2 border-[#E7A96B]"
            aria-hidden="true"
          />
          {/* Bottom-Left */}
          <span
            className="absolute bottom-[14px] left-[14px] w-[22px] h-[22px] border-b-2 border-l-2 border-[#E7A96B]"
            aria-hidden="true"
          />
          {/* Bottom-Right */}
          <span
            className="absolute bottom-[14px] right-[14px] w-[22px] h-[22px] border-b-2 border-r-2 border-[#E7A96B]"
            aria-hidden="true"
          />
        </div>
      )}

      {/* OPTIONAL GLASS INFO TAG AT BOTTOM-LEFT */}
      {options.infoTag && infoTagContent && (
        <div className="absolute bottom-4 left-4 z-20 max-w-[85%] px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-[#F5F3EF] shadow-xl flex items-center gap-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E7A96B] shrink-0" />
          <span className="font-semibold tracking-wide truncate">{infoTagContent}</span>
        </div>
      )}
    </div>
  );
};
