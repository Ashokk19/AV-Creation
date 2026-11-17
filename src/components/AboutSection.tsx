import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface AboutSectionProps {
  onRequestCustom?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onRequestCustom }) => {
  const stats = [
    { metric: '0.08 mm', label: 'Fine Layer Precision' },
    { metric: '±0.05 mm', label: 'Calibrated Tolerance' },
    { metric: 'PLA+ / PETG', label: 'Bio-Derived Polymers' },
    { metric: 'CoreXY', label: 'Direct Toolpaths' },
  ];

  return (
    <section
      id="about"
      className="scroll-mt-24 max-w-[1080px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(43,39,33,0.56)] mb-5">
        About the Studio
      </p>

      {/* Main Split matching meng-to-sketchbook .about + bloom.png */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-14 items-center">
        <div className="space-y-5">
          <h2 className="sb-display text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] text-[#2b2721] [text-wrap:balance]">
            Digital Ideas. <span className="italic text-[#9a6a3e]">Real-World Creations.</span>
          </h2>

          <p className="sb-prose text-base sm:text-[18.5px] leading-[1.72] text-[rgba(43,39,33,0.84)] max-w-[58ch]">
            At AV Creations, we believe every great creation begins with an idea. Through 3D printing, we turn those ideas into real objects that bring creativity, joy, and character into everyday life.
          </p>

          <p className="sb-prose text-base sm:text-[18.5px] leading-[1.72] text-[rgba(43,39,33,0.78)] max-w-[58ch]">
            From playful articulated toys and interactive clickers to decorative lamps and unique home décor, every piece is sliced with calibrated precision and inspected by hand before leaving our studio.
          </p>

          {onRequestCustom && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRequestCustom}
                className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] text-[#2b2721] hover:text-[#784f2b] border-b border-[rgba(43,39,33,0.3)] hover:border-[#784f2b] pb-1 transition-colors cursor-pointer"
              >
                <span>Commission a Custom Creation</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <img
          src="/assets/sketchbook/bloom.png"
          alt="AV Creations botanical notebook accent"
          loading="lazy"
          decoding="async"
          className="w-40 sm:w-52 lg:w-60 mx-auto opacity-85 select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Studio Craft Specs Row */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[rgba(43,39,33,0.14)] bg-[rgba(250,247,239,0.5)]">
        {stats.map((item) => (
          <div
            key={item.label}
            className="p-5 sm:p-6 border-r border-b border-[rgba(43,39,33,0.14)]"
          >
            <strong className="sb-display text-2xl sm:text-3xl font-normal text-[#2b2721] block tabular-nums">
              {item.metric}
            </strong>
            <span className="block mt-1 text-[10px] uppercase tracking-[0.18em] text-[rgba(43,39,33,0.62)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
