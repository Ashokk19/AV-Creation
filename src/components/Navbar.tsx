import React, { useState, useEffect } from 'react';
import { Search, Bookmark, ShoppingBag, Menu, X, ArrowUpRight, ShieldCheck, Instagram } from 'lucide-react';
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let previousY = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 20);

      // Always show at top of page
      if (currentY <= 30) {
        setIsHeaderVisible(true);
      } else if (currentY > previousY + 8 && currentY > 60) {
        // Scrolling down -> hide header on mobile to reveal content
        setIsHeaderVisible(false);
      } else if (currentY < previousY - 6) {
        // Scrolling up -> reveal header smoothly
        setIsHeaderVisible(true);
      }
      previousY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string; view: 'home' | 'collections' | 'custom' | 'about' }[] = [
    { label: 'Discover', view: 'home' },
    { label: 'Collections', view: 'collections' },
    { label: 'Custom Prints', view: 'custom' },
    { label: 'About', view: 'about' },
  ];

  const handleLinkClick = (view: 'home' | 'collections' | 'custom' | 'about') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
          !isHeaderVisible && !mobileMenuOpen ? '-translate-y-full md:translate-y-0' : 'translate-y-0'
        } ${
          isScrolled
            ? 'bg-[#101010]/95 backdrop-blur-md border-b border-[#242424] py-3 shadow-2xl'
            : 'bg-gradient-to-b from-[#101010]/95 via-[#101010]/80 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            {/* Zone 1: Brand Wordmark with 3D Filament Emblem Logo */}
            <button
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group shrink-0 cursor-pointer"
              aria-label="AV Creation Home"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/assets/aistudio/AV_Creations_Logo_with_3D_Printer_Icon_29dbcfaa.png"
                  alt="AV Creations 3D Studio Logo"
                  className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(231,169,107,0.2)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-extrabold tracking-wider text-[#F5F3EF] uppercase">
                  AV CREATIONS
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest text-[#E7A96B] uppercase font-mono -mt-1 font-semibold">
                  3D Studio · Additive Craft
                </span>
              </div>
            </button>

            {/* Zone 2: Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = activeView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => handleLinkClick(link.view)}
                    className={`relative py-1 transition-colors whitespace-nowrap text-sm cursor-pointer ${
                      isActive
                        ? 'text-[#F5F3EF] font-semibold'
                        : 'text-[#A6A6A6] hover:text-[#F5F3EF]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E7A96B] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Instagram, Search, Favorites, Admin Portal, Request Custom CTA) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Instagram Profile Trigger */}
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#A6A6A6] hover:text-[#E7A96B] hover:bg-[#1E1E1E] rounded-md transition-colors flex items-center justify-center cursor-pointer group"
                aria-label={`Visit AV Creations Instagram profile (@${INSTAGRAM_USERNAME})`}
                title={`Instagram (@${INSTAGRAM_USERNAME})`}
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 text-[#A6A6A6] hover:text-[#F5F3EF] hover:bg-[#1E1E1E] rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                aria-label="Search creations"
                title="Search creations (/)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline text-xs text-[#737373] font-mono border border-[#2D2D2D] px-1.5 py-0.5 rounded">
                  /
                </span>
              </button>

              {/* Saved Items / Favorites Trigger */}
              <button
                onClick={onOpenFavorites}
                className="relative p-2 text-[#A6A6A6] hover:text-[#F5F3EF] hover:bg-[#1E1E1E] rounded-md transition-colors cursor-pointer"
                aria-label={`View saved creations (${favoritesCount})`}
                title="Saved creations"
              >
                <Bookmark className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E7A96B] text-[#101010] text-[10px] font-bold flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Shopping Cart Trigger */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-[#A6A6A6] hover:text-[#F5F3EF] hover:bg-[#1E1E1E] rounded-md transition-colors cursor-pointer"
                aria-label={`View shopping cart (${cartCount})`}
                title="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-[#101010] text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Admin Dashboard shortcut for verified admins */}
              {isAdmin && onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-semibold text-[#E7A96B] bg-[#1E1E22] hover:bg-[#2A2A30] border border-[#E7A96B]/40 rounded-md transition-colors cursor-pointer"
                  title="Go to Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Primary Action Button */}
              <button
                onClick={onRequestCustom}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F0B87E] rounded-md transition-all shadow-sm hover:shadow-md hover:shadow-[#E7A96B]/20 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>Custom Print</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#A6A6A6] hover:text-[#F5F3EF] hover:bg-[#1E1E1E] rounded-md cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Zone 4: Mobile Touch-Scrollable Moving Navigation Strip */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-[#24242A]/80 mt-2.5 -mx-4 px-4 scroll-smooth">
            {navLinks.map((link) => {
              const isActive = activeView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleLinkClick(link.view)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#E7A96B] text-[#101010] font-bold shadow-xs'
                      : 'bg-[#18181C] text-[#A6A6A6] hover:text-[#F5F3EF] border border-[#27272D]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                onRequestCustom();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#E7A96B]/15 text-[#E7A96B] border border-[#E7A96B]/30 shrink-0 cursor-pointer"
            >
              + Custom Print
            </button>
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#18181C] text-[#A6A6A6] hover:text-[#E7A96B] border border-[#27272D] shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Instagram className="w-3 h-3 text-[#E7A96B]" />
              <span>@{INSTAGRAM_USERNAME}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer with Smooth Scroll & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Click Dismiss */}
          <div
            className="fixed inset-0 z-30 bg-black/75 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 top-[100px] z-35 bg-[#141416] border-b border-[#242428] px-6 py-6 flex flex-col gap-4 md:hidden max-h-[calc(100dvh-100px)] overflow-y-auto overscroll-contain shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => handleLinkClick(link.view)}
                  className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeView === link.view
                      ? 'bg-[#E7A96B] text-[#101010] font-bold shadow-xs'
                      : 'text-[#A6A6A6] hover:bg-[#1E1E22] hover:text-[#F5F3EF]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {isAdmin && onNavigateToAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToAdmin();
                  }}
                  className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#E7A96B] bg-[#1E1E22] hover:bg-[#2A2A30] flex items-center gap-2 cursor-pointer border border-[#E7A96B]/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-[#262626] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="flex items-center gap-2 text-sm text-[#A6A6A6] hover:text-[#F5F3EF] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Cart ({cartCount})</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFavorites();
                  }}
                  className="flex items-center gap-2 text-sm text-[#A6A6A6] hover:text-[#F5F3EF] cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 text-[#E7A96B]" />
                  <span>Saved ({favoritesCount})</span>
                </button>
              </div>

              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-[#F5F3EF] hover:text-[#FFFFFF] bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] transition-opacity cursor-pointer shadow-sm"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow @{INSTAGRAM_USERNAME} on Instagram</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestCustom();
                }}
                className="w-full py-2.5 text-xs font-bold text-[#101010] bg-[#E7A96B] hover:bg-[#F0B87E] rounded-lg text-center cursor-pointer shadow-md"
              >
                Request Custom Order
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
