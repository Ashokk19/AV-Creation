import React, { useState, useEffect } from 'react';
import { Search, Bookmark, ShoppingBag, ArrowUpRight, ShieldCheck, Instagram, X, Menu } from 'lucide-react';
import { INSTAGRAM_PROFILE_URL, INSTAGRAM_USERNAME } from '../lib/config';

interface NavbarProps {
  activeView: 'home' | 'collections' | 'custom' | 'about';
  onNavigate: (view: 'home' | 'collections' | 'custom' | 'about') => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onRequestCustom: () => void;
  isAdmin?: boolean;
  onNavigateToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  favoritesCount,
  onOpenFavorites,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onRequestCustom,
  isAdmin = false,
  onNavigateToAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: {
    label: string;
    view: 'home' | 'collections' | 'custom' | 'about';
  }[] = [
    { label: 'Catalogue', view: 'home' },
    { label: 'Collections', view: 'collections' },
    { label: 'Custom Prints', view: 'custom' },
    { label: 'Studio', view: 'about' },
  ];

  const handleLinkClick = (view: 'home' | 'collections' | 'custom' | 'about') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[rgba(245,241,232,0.9)] backdrop-blur-md border-b border-[rgba(43,39,33,0.12)] shadow-[0_6px_24px_rgba(43,39,33,0.06)]'
            : 'bg-gradient-to-b from-[rgba(236,231,220,0.92)] via-[rgba(236,231,220,0.72)] to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark with AV Creations Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#784f2b] rounded-sm shrink-0 cursor-pointer"
            aria-label="AV Creations Home"
          >
            <img
              src="/assets/aistudio/AV_Creations_Logo_with_3D_Printer_Icon_29dbcfaa.png"
              alt="AV Creations"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
            />
            <span className="sb-display text-xl sm:text-2xl tracking-[0.02em] text-[#2b2721] whitespace-nowrap">
              AV Creations
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const isActive = activeView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleLinkClick(link.view)}
                  className={`relative py-1 text-[15px] tracking-[0.04em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#2b2721] font-medium'
                      : 'text-[rgba(43,39,33,0.64)] hover:text-[#2b2721]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#9a6a3e]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Action Icons & Primary Custom Print CTA */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[rgba(43,39,33,0.65)] hover:text-[#2b2721] rounded-sm transition-colors cursor-pointer"
              aria-label={`Visit AV Creations Instagram profile (@${INSTAGRAM_USERNAME})`}
              title={`Instagram (@${INSTAGRAM_USERNAME})`}
            >
              <Instagram className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenSearch}
              className="p-2 text-[rgba(43,39,33,0.65)] hover:text-[#2b2721] rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              aria-label="Search creations"
              title="Search catalogue (/)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline text-[10px] font-mono text-[rgba(43,39,33,0.52)] border border-[rgba(43,39,33,0.18)] px-1.5 py-0.5 rounded-sm">
                /
              </span>
            </button>

            <button
              onClick={onOpenFavorites}
              className="relative p-2 text-[rgba(43,39,33,0.65)] hover:text-[#2b2721] rounded-sm transition-colors cursor-pointer"
              aria-label={`View saved creations (${favoritesCount})`}
              title="Saved creations"
            >
              <Bookmark className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#9a6a3e] text-[#faf7ef] text-[10px] font-semibold tabular-nums flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-2 text-[rgba(43,39,33,0.65)] hover:text-[#2b2721] rounded-sm transition-colors cursor-pointer"
              aria-label={`View shopping cart (${cartCount})`}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#2b2721] text-[#faf7ef] text-[10px] font-semibold tabular-nums flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isAdmin && onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#784f2b] border border-[rgba(154,106,62,0.4)] bg-[rgba(250,247,239,0.75)] hover:border-[#784f2b] rounded-sm transition-colors cursor-pointer whitespace-nowrap"
                title="Go to Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            <button
              onClick={onRequestCustom}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[#faf7ef] bg-[#2b2721] hover:bg-[#784f2b] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Custom Print</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#2b2721] rounded-sm cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Editorial Sheet Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#ece7dc]/98 backdrop-blur-lg flex flex-col justify-between p-6 pt-6 pb-10 lg:hidden overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(43,39,33,0.14)]">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/AV_Creations_Logo_with_3D_Printer_Icon_29dbcfaa.png"
                alt="AV Creations"
                className="w-8 h-8 object-contain"
              />
              <span className="sb-display text-xl text-[#2b2721]">AV Creations</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-sm border border-[rgba(43,39,33,0.18)] text-[#2b2721] cursor-pointer"
              aria-label="Close mobile menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-auto py-8 flex flex-col divide-y divide-[rgba(43,39,33,0.12)]">
            {navLinks.map((link, idx) => {
              const isActive = activeView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleLinkClick(link.view)}
                  className="py-5 flex items-baseline justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs tabular-nums text-[rgba(43,39,33,0.5)]">
                      0{idx + 1}
                    </span>
                    <span
                      className={`sb-display text-3xl ${
                        isActive ? 'text-[#784f2b] italic' : 'text-[#2b2721]'
                      }`}
                    >
                      {link.label}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[rgba(43,39,33,0.48)]" />
                </button>
              );
            })}

            {isAdmin && onNavigateToAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToAdmin();
                }}
                className="py-5 flex items-center justify-between text-left text-[#784f2b] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="sb-display text-2xl">Admin Portal</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="pt-5 border-t border-[rgba(43,39,33,0.14)] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="py-3 px-4 border border-[rgba(43,39,33,0.2)] bg-[#faf7ef] text-xs uppercase tracking-[0.14em] text-[#2b2721] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#9a6a3e]" />
                <span>Cart ({cartCount})</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenFavorites();
                }}
                className="py-3 px-4 border border-[rgba(43,39,33,0.2)] bg-[#faf7ef] text-xs uppercase tracking-[0.14em] text-[#2b2721] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-[#9a6a3e]" />
                <span>Saved ({favoritesCount})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestCustom();
              }}
              className="w-full py-3.5 text-xs uppercase tracking-[0.18em] text-[#faf7ef] bg-[#2b2721] hover:bg-[#784f2b] transition-colors cursor-pointer"
            >
              Request Custom Print
            </button>
          </div>
        </div>
      )}
    </>
  );
};
