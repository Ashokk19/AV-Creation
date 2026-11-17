import React from 'react';
import { ArrowUp, ArrowUpRight, Lock, Instagram } from 'lucide-react';
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_USERNAME } from '../lib/config';

interface FooterProps {
  onNavigate: (view: 'home' | 'collections' | 'custom' | 'about') => void;
  onRequestCustom: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onRequestCustom,
  onNavigateToAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 max-w-[1080px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-16 border-t border-[rgba(43,39,33,0.14)] text-[#2b2721]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[rgba(43,39,33,0.12)] items-start">
        {/* Brand Block */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/AV_Creations_Logo_with_3D_Printer_Icon_29dbcfaa.png"
              alt="AV Creations"
              className="w-10 h-10 object-contain shrink-0"
            />
            <div>
              <span className="sb-display text-2xl text-[#2b2721] block leading-none">
                AV Creations
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[rgba(43,39,33,0.58)] block mt-1">
                Additive Manufacturing Studio
              </span>
            </div>
          </div>

          <p className="sb-prose text-sm sm:text-base leading-relaxed text-[rgba(43,39,33,0.74)] max-w-md pt-1">
            Crafting ambient luminaires, articulated collectibles, and bespoke 3D printed editions — layer by layer.
          </p>

          <div className="pt-1">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#784f2b] hover:text-[#2b2721] transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{INSTAGRAM_USERNAME}</span>
            </a>
          </div>
        </div>

        {/* Chapters Navigation */}
        <div className="md:col-span-3 space-y-2.5">
          <h4 className="text-[10px] uppercase tracking-[0.22em] text-[rgba(43,39,33,0.56)]">
            Catalogue
          </h4>
          <ul className="space-y-2 sb-prose text-sm text-[rgba(43,39,33,0.78)]">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#784f2b] transition-colors cursor-pointer"
              >
                Sketchbook Editions
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('collections')}
                className="hover:text-[#784f2b] transition-colors cursor-pointer"
              >
                Complete Collections
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('custom')}
                className="hover:text-[#784f2b] transition-colors cursor-pointer"
              >
                Custom Commissions
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-[#784f2b] transition-colors cursor-pointer"
              >
                About Studio
              </button>
            </li>
          </ul>
        </div>

        {/* Commission & Admin */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-[10px] uppercase tracking-[0.22em] text-[rgba(43,39,33,0.56)]">
            Bespoke Orders
          </h4>
          <p className="sb-prose text-sm text-[rgba(43,39,33,0.74)] leading-relaxed">
            Have an idea for a personalized gift, lamp, or multi-part print?
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onRequestCustom}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-[11px] uppercase tracking-[0.16em] rounded-sm transition-colors cursor-pointer"
            >
              <span>Start Custom Order</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.62)] hover:text-[#2b2721] transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 text-[#9a6a3e]" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Colophon */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-[rgba(43,39,33,0.56)]">
        <div>© {new Date().getFullYear()} AV Creations · Studio Catalogue</div>
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 hover:text-[#2b2721] transition-colors cursor-pointer"
          aria-label="Back to top of page"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
