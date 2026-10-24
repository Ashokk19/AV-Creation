/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductItem, ColorVariant, CategoryRecord, ProductRecord, CartItem } from './types';
import { getCategoryCarousels } from './utils/filterLogic';
import { fetchCategories, fetchProducts, mapProductRecordToItem } from './services/productService';
import { getCurrentAdmin } from './services/authService';
import { Navbar } from './components/Navbar';
import { HeroFeature } from './components/HeroFeature';
import { CollectionRow } from './components/CollectionRow';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CollectionsView } from './components/CollectionsView';
import { CustomPrintSection } from './components/CustomPrintSection';
import { AboutSection } from './components/AboutSection';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { User } from '@supabase/supabase-js';

export default function App() {
  // Routing state based on URL pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  // Admin Auth State
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Public Catalog State (Loaded dynamically from Supabase)
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Public View state for the main site
  const [activeView, setActiveView] = useState<'home' | 'collections'>('home');
  const [activeNavSection, setActiveNavSection] = useState<'home' | 'collections' | 'custom' | 'about'>('home');
  const [selectedCategoryForCollections, setSelectedCategoryForCollections] = useState<string>('all');

  // Modal & Drawer states
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [customInquiryPreFill, setCustomInquiryPreFill] = useState<string>('');

  // Favorites state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('av_creation_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('av_creation_favorites', JSON.stringify(favoriteIds));
    } catch {
      // ignore storage error
    }
  }, [favoriteIds]);

  // Shopping Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('av_creation_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('av_creation_cart', JSON.stringify(cartItems));
    } catch {
      // ignore storage error
    }
  }, [cartItems]);

  // Synchronize cart items with live product updates from Supabase (prices, status, etc.)
  useEffect(() => {
    if (products.length === 0) return;
    setCartItems((prevItems) => {
      let hasChanged = false;
      const updated = prevItems.map((item) => {
        const live = products.find((p) => p.id === item.product.id);
        if (live && live !== item.product) {
          hasChanged = true;
          return {
            ...item,
            product: live,
          };
        }
        return item;
      });
      return hasChanged ? updated : prevItems;
    });
  }, [products]);

  // Cart Action Handlers
  const handleAddToCart = (product: ProductItem, quantity = 1, selectedColor?: ColorVariant) => {
    const chosenColor = selectedColor || product.availableColors[0];
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor?.name === chosenColor?.name
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + Math.max(1, quantity),
          product,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.max(1, quantity),
          selectedColor: chosenColor,
          addedAt: new Date().toISOString(),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, selectedColorName?: string) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && (!selectedColorName || item.selectedColor?.name === selectedColorName)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string, selectedColorName?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && (!selectedColorName || item.selectedColor?.name === selectedColorName)))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Navigate helper with browser History pushState
  const navigateTo = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check Admin Session on mount
  const checkAdminSession = useCallback(async () => {
    setIsAuthChecking(true);
    try {
      const { user, isAdmin: isVerifiedAdmin } = await getCurrentAdmin();
      setAdminUser(user);
      setIsAdmin(isVerifiedAdmin);
    } catch (err) {
      setAdminUser(null);
      setIsAdmin(false);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  // Load Categories & Products Dynamically from Supabase
  const loadDynamicCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const [catRecords, prodRecords] = await Promise.all([
        fetchCategories(),
        fetchProducts({ status: 'active' }),
      ]);
      setCategories(catRecords);
      const mappedItems = prodRecords.map(mapProductRecordToItem);
      setProducts(mappedItems);
    } catch (err) {
      console.error('Failed to load dynamic catalog:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadDynamicCatalog();
  }, [loadDynamicCatalog]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !isSearchOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleSelectEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ProductItem>;
      if (customEvent.detail) {
        setSelectedProduct(customEvent.detail);
      }
    };
    window.addEventListener('av-select-product', handleSelectEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('av-select-product', handleSelectEvent);
    };
  }, [isSearchOpen]);

  // Toggle favorite
  const handleToggleFavorite = (product: ProductItem) => {
    setFavoriteIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const handleClearFavorites = () => {
    setFavoriteIds([]);
  };

  // Featured hero item (if any exists in Supabase, pick the featured one; otherwise null)
  const featuredHeroProduct = useMemo(() => {
    return products.find((p) => p.featured) || (products.length > 0 ? products[0] : null);
  }, [products]);

  // Dynamic Category Carousels for public home view
  const carousels = useMemo(() => {
    return getCategoryCarousels(categories, products);
  }, [categories, products]);

  // Favorite product items
  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favoriteIds.includes(p.id));
  }, [products, favoriteIds]);

  // Related products for detail modal
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter(
      (p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.featured)
    );
  }, [selectedProduct, products]);

  // Scroll spy to highlight active nav link on home page
  useEffect(() => {
    if (activeView !== 'home') {
      setActiveNavSection('collections');
      return;
    }

    const handleScrollSpy = () => {
      const customEl = document.getElementById('custom-prints');
      const aboutEl = document.getElementById('about');
      const scrollPos = window.scrollY + 180;

      if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveNavSection('about');
      } else if (customEl && scrollPos >= customEl.offsetTop) {
        setActiveNavSection('custom');
      } else {
        setActiveNavSection('home');
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [activeView]);

  // Public Navigation handlers
  const handlePublicNavigate = (view: 'home' | 'collections' | 'custom' | 'about') => {
    if (currentPath !== '/') {
      navigateTo('/');
    }

    if (view === 'collections') {
      setActiveView('collections');
      setActiveNavSection('collections');
      setSelectedCategoryForCollections('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'custom') {
      setActiveView('home');
      setActiveNavSection('custom');
      const doScroll = () => {
        const el = document.getElementById('custom-prints');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      doScroll();
      setTimeout(doScroll, 60);
      setTimeout(doScroll, 180);
      setTimeout(doScroll, 350);
    } else if (view === 'about') {
      setActiveView('home');
      setActiveNavSection('about');
      const doScroll = () => {
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      doScroll();
      setTimeout(doScroll, 60);
      setTimeout(doScroll, 180);
      setTimeout(doScroll, 350);
    } else {
      setActiveView('home');
      setActiveNavSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewCategory = (categorySlug: string) => {
    setSelectedCategoryForCollections(categorySlug);
    setActiveView('collections');
    if (currentPath !== '/') {
      navigateTo('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreClick = () => {
    const el = document.getElementById('browse-creations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestOrderFromProduct = (product: ProductItem, selectedColor: ColorVariant) => {
    setSelectedProduct(null);
    setCustomInquiryPreFill(`${product.title} in ${selectedColor.name} (${product.specs.layerResolution})`);
    setActiveView('home');
    if (currentPath !== '/') {
      navigateTo('/');
    }
    setTimeout(() => {
      const el = document.getElementById('custom-prints');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleInquireBatch = (inquireProducts: ProductItem[]) => {
    const titles = inquireProducts.map((p) => p.title).join(', ');
    setCustomInquiryPreFill(`Saved Creations: ${titles}`);
    setActiveView('home');
    if (currentPath !== '/') {
      navigateTo('/');
    }
    setTimeout(() => {
      const el = document.getElementById('custom-prints');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // ROUTE 1: ADMIN LOGIN (/admin/login)
  if (currentPath === '/admin/login') {
    if (!isAuthChecking && isAdmin && adminUser) {
      // Already authenticated admin -> redirect to /admin
      navigateTo('/admin');
      return null;
    }
    return (
      <AdminLogin
        onLoginSuccess={async () => {
          await checkAdminSession();
          await loadDynamicCatalog();
          navigateTo('/admin');
        }}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // ROUTE 2: PROTECTED ADMIN DASHBOARD (/admin)
  if (currentPath.startsWith('/admin')) {
    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-[#101010] flex items-center justify-center text-xs font-mono text-[#E7A96B]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#E7A96B] border-t-transparent rounded-full animate-spin" />
            <span>Verifying Administrator Access...</span>
          </div>
        </div>
      );
    }

    // Security Gate: User must be authenticated and verified as admin
    if (!isAdmin || !adminUser) {
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
        window.history.replaceState({}, '', '/admin/login');
      }
      return (
        <AdminLogin
          onLoginSuccess={async () => {
            await checkAdminSession();
            await loadDynamicCatalog();
            navigateTo('/admin');
          }}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminDashboard
        adminEmail={adminUser.email}
        onLogout={async () => {
          setAdminUser(null);
          setIsAdmin(false);
          await loadDynamicCatalog();
          navigateTo('/admin/login');
        }}
        onViewPortfolio={() => {
          loadDynamicCatalog();
          navigateTo('/');
        }}
      />
    );
  }

  // ROUTE 3: PUBLIC CINEMATIC PORTFOLIO (Home & Collections)
  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F3EF] font-sans antialiased selection:bg-[#E7A96B]/30 selection:text-[#F5F3EF]">
      {/* Navigation Bar */}
      <Navbar
        activeView={activeNavSection}
        onNavigate={handlePublicNavigate}
        favoritesCount={favoriteIds.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRequestCustom={() => {
          setCustomInquiryPreFill('');
          handlePublicNavigate('custom');
        }}
        isAdmin={isAdmin}
        onNavigateToAdmin={() => navigateTo('/admin')}
      />

      {/* Main Public Content Area */}
      <main>
        {activeView === 'collections' ? (
          /* Dedicated Curated Collections Gallery View */
          <CollectionsView
            initialCategory={selectedCategoryForCollections}
            categories={categories}
            allProducts={products}
            favorites={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onBackToDiscover={() => handlePublicNavigate('home')}
            onRequestCustom={() => handlePublicNavigate('custom')}
          />
        ) : (
          /* Netflix-Style Cinematic Home Discovery View */
          <>
            {/* Immersive Cinematic Hero */}
            <HeroFeature
              product={featuredHeroProduct}
              onExplore={handleExploreClick}
              onViewProduct={(p) => setSelectedProduct(p)}
              onRequestCustom={() => handlePublicNavigate('custom')}
            />

            {/* Horizontal Netflix-Inspired Content Rows (Dynamic from Supabase) */}
            <div id="browse-creations" className="space-y-4 pt-6 pb-12">
              {carousels.map((carousel) => (
                <CollectionRow
                  key={carousel.id}
                  id={carousel.id}
                  title={carousel.title}
                  subtitle={carousel.subtitle}
                  items={carousel.items}
                  favorites={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onViewCategory={handleViewCategory}
                  onRequestCustom={(categoryTitle) => {
                    setCustomInquiryPreFill(categoryTitle ? `Custom ${categoryTitle} Print` : '');
                    handlePublicNavigate('custom');
                  }}
                  categorySlug={carousel.id !== 'featured' ? carousel.id : undefined}
                />
              ))}
            </div>

            {/* Custom 3D Printing Feature & Technical Estimator */}
            <CustomPrintSection initialItemName={customInquiryPreFill} />

            {/* About AV Creation & Workshop Craft */}
            <AboutSection />
          </>
        )}
      </main>

      {/* Footer with Discreet Admin Portal link */}
      <Footer
        onNavigate={handlePublicNavigate}
        onRequestCustom={() => {
          setCustomInquiryPreFill('');
          handlePublicNavigate('custom');
        }}
        onNavigateToAdmin={() => navigateTo('/admin/login')}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        isFavorite={selectedProduct ? favoriteIds.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onRequestOrder={handleRequestOrderFromProduct}
        onAddToCart={(p, q, c) => handleAddToCart(p, q, c)}
        onSelectRelated={(p) => setSelectedProduct(p)}
        relatedProducts={relatedProducts}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onSelectProduct={(p) => {
          setIsCartOpen(false);
          setSelectedProduct(p);
        }}
      />

      {/* Favorites / Saved Creations Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteProducts}
        onRemoveFavorite={handleToggleFavorite}
        onClearAll={handleClearFavorites}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onInquireBatch={handleInquireBatch}
      />

      {/* Global Search Dialog Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allProducts={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
}
