import React from 'react';
import { ArrowUp, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'collections' | 'custom' | 'about') => void;
  onRequestCustom: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onRequestCustom, onNavigateToAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0C0C0E] border-t border-[#1C1C20] text-[#A1A1AA] text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#1A1A1E]">
          {/* Brand Info with 3D Emblem */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md overflow-hidden bg-transparent flex items-center justify-center p-0.5">
                <img
                  src="/assets/aistudio/AV_Creations_3D_Filament_Emblem_89987b51.png"
                  alt="AV Creations Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base font-extrabold tracking-widest text-[#F5F3EF] uppercase">
                AV CREATIONS
              </span>
            </div>
            <p className="text-xs text-[#8E8E93] max-w-sm leading-relaxed">
              An independent 3D printing and computational design studio dedicated to high-fidelity additive manufacturing, ambient luminaires, and kinetic physical creations.
            </p>
            <div className="text-[11px] font-mono text-[#71717A] space-y-1">
              <div>Studio: Precision Additive Workshop</div>
              <div>Operating CoreXY Extrusions & Resin Light Engines</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F3EF]">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                >
                  Discover
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collections')}
                  className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                >
                  Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('custom')}
                  className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                >
                  Custom Commissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
                >
                  Studio Ethos
                </button>
              </li>
            </ul>
          </div>

          {/* Curated Disciplines */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F3EF]">
              Disciplines
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-[#8E8E93]">
              <li>Tea Lights & Ambient Lighting</li>
              <li>Kinetic Clickers & Flexi Toys</li>
              <li>Pokemon & Collectible Figures</li>
              <li>Wall Decors & Relief Geometry</li>
              <li>Bespoke Additive Prototypes</li>
            </ul>
          </div>

          {/* Custom Print Quick Callout & Admin Access */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F3EF]">
              Commission
            </h4>
            <p className="text-xs text-[#8E8E93]">
              Need a personalized gift or prototype?
            </p>
            <button
              onClick={onRequestCustom}
              className="px-3.5 py-2 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              Start Custom Order
            </button>

            {onNavigateToAdmin && (
              <div className="pt-2">
                <button
                  onClick={onNavigateToAdmin}
                  className="flex items-center gap-1.5 text-[11px] text-[#71717A] hover:text-[#A1A1AA] transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-[#E7A96B]" />
                  <span>Admin Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#71717A]">
          <div>
            © {new Date().getFullYear()} AV CREATIONS. All rights reserved. Layer by layer.
          </div>

          <div className="flex items-center gap-6">
            <span>PLA+ / PETG / Resin Certified</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-[#F5F3EF] transition-colors cursor-pointer"
              aria-label="Back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
