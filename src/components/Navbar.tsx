import React, { useState, useEffect } from 'react';
import { Search, Bookmark, ShoppingBag, Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';

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
      setIsScrolled(window.scrollY > 40);
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#101010]/95 backdrop-blur-md border-b border-[#242424] py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-[#101010]/90 via-[#101010]/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark with 3D Filament Emblem Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            aria-label="AV Creation Home"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-transparent flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <img
                src="/assets/aistudio/Glossy_AV_Creations_Mascot_Emblem_e418bb80.png"
                alt="AV Creation Mascot 3D Emblem"
                className="w-full h-full object-contain drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-wider text-[#F5F3EF] uppercase">
                AV CREATIONS
              </span>
              <span className="text-[10px] tracking-widest text-[#E7A96B] uppercase font-mono -mt-1 font-semibold">
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
                  className={`relative py-1 transition-colors whitespace-nowrap text-sm ${
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

          {/* Zone 3: Actions (Search, Favorites, Admin Portal, Request Custom CTA) */}
          <div className="flex items-center gap-3 shrink-0">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-[#E7A96B] bg-[#1E1E22] hover:bg-[#2A2A30] border border-[#E7A96B]/40 rounded-md transition-colors"
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
              className="md:hidden p-2 text-[#A6A6A6] hover:text-[#F5F3EF] hover:bg-[#1E1E1E] rounded-md"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[65px] z-30 bg-[#141414] border-b border-[#242428] px-6 py-6 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => handleLinkClick(link.view)}
                className={`text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeView === link.view
                    ? 'bg-[#222222] text-[#F5F3EF]'
                    : 'text-[#A6A6A6] hover:bg-[#1A1A1A] hover:text-[#F5F3EF]'
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
                className="text-left px-3 py-2.5 rounded-md text-sm font-medium text-[#E7A96B] bg-[#1E1E22] hover:bg-[#2A2A30] flex items-center gap-2"
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
                className="flex items-center gap-2 text-sm text-[#A6A6A6] hover:text-[#F5F3EF]"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Cart ({cartCount})</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenFavorites();
                }}
                className="flex items-center gap-2 text-sm text-[#A6A6A6] hover:text-[#F5F3EF]"
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved ({favoritesCount})</span>
              </button>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestCustom();
              }}
              className="w-full py-2.5 text-xs font-semibold text-[#101010] bg-[#E7A96B] rounded-md text-center"
            >
              Custom Order
            </button>
          </div>
        </div>
      )}
    </>
  );
};
