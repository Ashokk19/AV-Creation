import React from 'react';
import { Layers, Flame, Wrench, ShieldCheck, Compass, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-20 sm:py-28 bg-[#0D0D0F] border-t border-[#1C1C20] overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E7A96B]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Split: Headline & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-16">
          <div className="lg:col-span-5">
            <span className="text-xs font-mono font-semibold tracking-widest text-[#E7A96B] uppercase">
              The AV Studio Ethos
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F3EF] mt-2 leading-[1.15] [text-wrap:balance]">
              Digital Ideas. Real-World Creations.
            </h2>
            <div className="mt-6 flex items-center gap-3 text-xs font-mono text-[#8E8E93]">
              <span>Additive Precision</span>
              <span aria-hidden="true">·</span>
              <span>Generative Geometry</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#E7A96B]">Bespoke Craft</span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 text-sm sm:text-base text-[#A1A1AA] leading-relaxed font-normal">
            <p>
              AV Creation started with a singular obsession: exploring the boundary where mathematical digital geometry transforms into physical, tactile objects. Where traditional industrial manufacturing demands rigid molds and compromises, 3D printing enables us to craft impossible overhangs, internal gyroid light labyrinths, and articulated print-in-place mechanisms.
            </p>
            <p>
              Every piece in this portfolio is produced inside our studio on carefully calibrated CoreXY motion systems. We tune print speeds down to 35mm/s on delicate outer perimeters, calibrate micro-retractions to eliminate stringing, and dial in heated chamber temperatures to guarantee layer adhesion that endures daily use.
            </p>
            <p className="text-[#F5F3EF] font-medium">
              We don&apos;t produce plastic novelty trinkets. We build durable lamps, kinetic flexi creatures, and architecture-grade functional objects crafted to be lived with, admired, and held.
            </p>
          </div>
        </div>

        {/* 3 Real Studio Craft Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#1F1F24]">
          <div className="bg-[#141416] border border-[#222226] p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#1E1E22] flex items-center justify-center text-[#E7A96B] mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F3EF] mb-2">
                0.08–0.16mm Layer Fidelity
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                By dialing in sub-fractional layer heights and high-precision hardened nozzles, layer lines transform from visual artifacts into subtle, textile-like surface textures that diffuse light with organic warmth.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1F1F24] text-[11px] font-mono text-[#71717A]">
              Tolerance: ±0.05 mm
            </div>
          </div>

          <div className="bg-[#141416] border border-[#222226] p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#1E1E22] flex items-center justify-center text-[#E7A96B] mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F3EF] mb-2">
                Curated Engineering Filaments
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                We formulate with plant-based corn-derived PLA+, shatter-resistant translucent PETG, real wood composite fibers, and chopped carbon fiber blends for industrial durability and safe indoor ambient lighting.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1F1F24] text-[11px] font-mono text-[#71717A]">
              Bio-Compatible & Recyclable
            </div>
          </div>

          <div className="bg-[#141416] border border-[#222226] p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#1E1E22] flex items-center justify-center text-[#E7A96B] mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F3EF] mb-2">
                Hand-Finished Quality Post-Process
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                No piece leaves the studio untreated. Supports are removed with surgical scalpel precision, seams are thermally smoothed, and functional threads and joints are dry-cycled to guarantee silky operation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1F1F24] text-[11px] font-mono text-[#71717A]">
              Inspected Layer by Layer
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
