import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  FolderTree,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Star,
  Copy,
  Database,
  RefreshCw,
  Search,
  Eye,
  X,
} from 'lucide-react';
import { CategoryRecord, ProductRecord } from '../../types';
import {
  fetchCategories,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/productService';
import { signOutAdmin } from '../../services/authService';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured, getProductImageUrl } from '../../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewPortfolio: () => void;
  adminEmail?: string;
}

type TabType = 'overview' | 'products' | 'categories' | 'add-product' | 'add-category' | 'database';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onViewPortfolio,
  adminEmail,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add / Edit Product Form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodStatus, setProdStatus] = useState<'active' | 'draft'>('active');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string>('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Add / Edit Category Form state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category';
    id: string;
    name: string;
    imagePath?: string;
  } | null>(null);

  // Search in products table
  const [productSearch, setProductSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts({ status: 'all' }),
      ]);
      setCategories(cats);
      setProducts(prods);
      if (cats.length > 0 && !prodCategory) {
        setProdCategory(cats[0].id);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setActionMessage({ type: 'error', text: 'Failed to load data from Supabase.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  };

  // Image File Selection & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showNotification('error', 'Please choose a valid JPG, PNG, or WebP image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showNotification('error', 'File size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  // Open Edit Product Modal / Form
  const startEditProduct = (product: ProductRecord) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdCategory(product.category_id);
    setProdShortDesc(product.short_description || '');
    setProdDesc(product.description || '');
    setProdFeatured(product.is_featured);
    setProdStatus(product.status);
    setExistingImagePath(product.image_path);
    setImagePreviewUrl(product.image_url || getProductImageUrl(product.image_path));
    setImageFile(null);
    setActiveTab('add-product');
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdName('');
    setProdShortDesc('');
    setProdDesc('');
    setProdFeatured(false);
    setProdStatus('active');
    setImageFile(null);
    setImagePreviewUrl(null);
    setExistingImagePath('');
    if (categories.length > 0) {
      setProdCategory(categories[0].id);
    }
  };

  // Handle Save Product (Create or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      showNotification('error', 'Product name is required.');
      return;
    }

    if (!prodCategory) {
      showNotification('error', 'Please select a category for this product.');
      return;
    }

    if (!editingProductId && !imageFile) {
      showNotification('error', 'A product image upload is required.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      if (editingProductId) {
        await updateProduct(
          editingProductId,
          {
            name: prodName,
            short_description: prodShortDesc,
            description: prodDesc,
            category_id: prodCategory,
            is_featured: prodFeatured,
            status: prodStatus,
          },
          imageFile
        );
        showNotification('success', `Product "${prodName}" updated successfully.`);
      } else {
        await createProduct(
          {
            name: prodName,
            short_description: prodShortDesc,
            description: prodDesc,
            category_id: prodCategory,
            is_featured: prodFeatured,
            status: prodStatus,
          },
          imageFile
        );
        showNotification('success', `Product "${prodName}" created and added to catalogue.`);
      }

      resetProductForm();
      setActiveTab('products');
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save product.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handle Save Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showNotification('error', 'Category name is required.');
      return;
    }

    setIsSubmittingCat(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, catName, catSlug);
        showNotification('success', `Category "${catName}" updated.`);
      } else {
        await createCategory(catName, catSlug);
        showNotification('success', `Category "${catName}" created.`);
      }

      setEditingCategoryId(null);
      setCatName('');
      setCatSlug('');
      setActiveTab('categories');
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save category.');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Handle Confirmed Deletions
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === 'product') {
        await deleteProduct(deleteConfirmation.id, deleteConfirmation.imagePath);
        showNotification('success', `Product "${deleteConfirmation.name}" deleted.`);
      } else {
        await deleteCategory(deleteConfirmation.id);
        showNotification('success', `Category "${deleteConfirmation.name}" deleted.`);
      }
      setDeleteConfirmation(null);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Deletion failed.');
    }
  };

  // Filtered Products for Products Tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      productSearch.trim() === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.short_description || '').toLowerCase().includes(productSearch.toLowerCase());

    const matchesCat = filterCategory === 'all' || p.category_id === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#F5F3EF] flex flex-col antialiased">
      {/* Admin Top Navigation Bar */}
      <header className="bg-[#141416] border-b border-[#222226] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-transparent flex items-center justify-center p-0.5">
              <img
                src="/assets/aistudio/AV_Creations_3D_Filament_Emblem_89987b51.png"
                alt="AV Creations"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-wider text-[#F5F3EF] uppercase">
                  AV CREATIONS
                </span>
                <span className="text-[10px] font-mono bg-[#E7A96B]/15 text-[#E7A96B] px-1.5 py-0.5 rounded font-semibold border border-[#E7A96B]/30">
                  ADMIN
                </span>
              </div>
              <div className="text-[11px] text-[#71717A] font-mono">
                {adminEmail || 'Verified Administrator'}
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onViewPortfolio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F3EF] hover:bg-[#1E1E22] rounded-md transition-colors cursor-pointer border border-[#27272A]"
              title="Return to Public Portfolio"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Site</span>
            </button>

            <button
              onClick={async () => {
                await signOutAdmin();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/40 border border-red-800/40 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar / Tabs */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (3 Cols) */}
        <aside className="md:col-span-3 bg-[#141416] border border-[#222226] rounded-xl p-3 space-y-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package, badge: products.length },
            { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
            { id: 'add-product', label: editingProductId ? 'Edit Product' : 'Add Product', icon: PlusCircle },
            { id: 'add-category', label: 'Add Category', icon: PlusCircle },
            { id: 'database', label: 'Supabase SQL Setup', icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'add-product' && !editingProductId) {
                    resetProductForm();
                  }
                  setActiveTab(item.id as TabType);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E7A96B] text-[#101010] font-bold shadow-sm'
                    : 'text-[#A1A1AA] hover:bg-[#1C1C20] hover:text-[#F5F3EF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#101010]/20 text-[#101010]' : 'bg-[#1E1E22] text-[#71717A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content View Area (9 Cols) */}
        <main className="md:col-span-9 space-y-6">
          {/* Notification Alert Banner */}
          {actionMessage && (
            <div
              className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
              <button
                onClick={() => setActionMessage(null)}
                className="text-[#71717A] hover:text-[#FFFFFF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#141416] border border-[#222226] p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#8E8E93] uppercase">Total Products</span>
                    <div className="text-2xl font-extrabold text-[#F5F3EF] mt-1 font-mono">
                      {products.length}
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1">
                      {products.filter((p) => p.status === 'active').length} active · {products.filter((p) => p.status === 'draft').length} draft
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#1E1E22] flex items-center justify-center text-[#E7A96B]">
                    <Package className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#141416] border border-[#222226] p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#8E8E93] uppercase">Categories</span>
                    <div className="text-2xl font-extrabold text-[#F5F3EF] mt-1 font-mono">
                      {categories.length}
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1">
                      Live on public portfolio
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#1E1E22] flex items-center justify-center text-[#E7A96B]">
                    <FolderTree className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#141416] border border-[#222226] p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#8E8E93] uppercase">Featured Works</span>
                    <div className="text-2xl font-extrabold text-[#F5F3EF] mt-1 font-mono">
                      {products.filter((p) => p.is_featured).length}
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1">
                      Highlighted on hero & rows
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#1E1E22] flex items-center justify-center text-[#E7A96B]">
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-[#141416] border border-[#222226] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3EF]">
                  <span>Quick Studio Actions:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('add-product');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] rounded-md transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Upload New Product</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCatName('');
                      setCatSlug('');
                      setActiveTab('add-category');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F5F3EF] bg-[#1E1E22] hover:bg-[#28282E] border border-[#2D2D32] rounded-md transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>New Category</span>
                  </button>
                </div>
              </div>

              {/* Recently Added Products Table */}
              <div className="bg-[#141416] border border-[#222226] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#222226] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#F5F3EF]">Recently Added Products</h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs text-[#E7A96B] hover:underline cursor-pointer"
                  >
                    View All ({products.length})
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#71717A] space-y-2">
                    <p>No products exist in your Supabase database yet.</p>
                    <button
                      onClick={() => setActiveTab('add-product')}
                      className="px-3.5 py-1.5 bg-[#E7A96B] text-[#101010] font-semibold rounded text-xs"
                    >
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#18181C] text-[#8E8E93] font-mono border-b border-[#222226]">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Created</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222226]">
                        {products.slice(0, 5).map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#1A1A1E] transition-colors">
                            <td className="p-3 flex items-center gap-3">
                              <div className="w-10 h-10 rounded overflow-hidden bg-[#101012] shrink-0 border border-[#2A2A2E]">
                                <img
                                  src={prod.image_url || getProductImageUrl(prod.image_path)}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-[#F5F3EF] truncate max-w-[200px]">
                                  {prod.name}
                                </div>
                                <div className="text-[10px] text-[#71717A] font-mono">
                                  /{prod.slug}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-[#A1A1AA]">
                              {prod.category?.name || 'Unassigned'}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  prod.status === 'active'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {prod.status}
                              </span>
                            </td>
                            <td className="p-3 text-[#71717A] font-mono">
                              {prod.created_at ? new Date(prod.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => startEditProduct(prod)}
                                  className="p-1.5 text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#25252A] rounded transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmation({
                                      type: 'product',
                                      id: prod.id,
                                      name: prod.name,
                                      imagePath: prod.image_path,
                                    })
                                  }
                                  className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl overflow-hidden space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#F5F3EF]">Product Catalogue Management</h2>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Manage, edit, publish, or remove 3D printed items in Supabase.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetProductForm();
                    setActiveTab('add-product');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] rounded-md transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex-1 min-w-[200px] relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product title or description..."
                    className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5 pointer-events-none" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71717A] font-mono">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-[#1A1A1E] text-[#F5F3EF] border border-[#2A2A2E] rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={loadData}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#1E1E22] rounded border border-[#2A2A2E]"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Products Table */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#71717A] space-y-2">
                  <p>No products match your search or filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#222226] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18181C] text-[#8E8E93] font-mono border-b border-[#222226]">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Featured</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222226]">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#1A1A1E] transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-[#101012] shrink-0 border border-[#2A2A2E]">
                              <img
                                src={prod.image_url || getProductImageUrl(prod.image_path)}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#F5F3EF] truncate max-w-[220px]">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-[#71717A] font-mono truncate max-w-[220px]">
                                {prod.short_description || `slug: ${prod.slug}`}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-[#A1A1AA]">
                            {prod.category?.name || 'Unassigned'}
                          </td>
                          <td className="p-3">
                            {prod.is_featured ? (
                              <span className="inline-flex items-center gap-1 text-[#E7A96B] font-semibold text-[11px]">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Featured</span>
                              </span>
                            ) : (
                              <span className="text-[#555] font-mono">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                prod.status === 'active'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {prod.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditProduct(prod)}
                                className="p-1.5 text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#25252A] rounded transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'product',
                                    id: prod.id,
                                    name: prod.name,
                                    imagePath: prod.image_path,
                                  })
                                }
                                className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES LIST */}
          {activeTab === 'categories' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#F5F3EF]">Category Management</h2>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Default categories: Tea Lights, Clickers, Pokemon, Wall Decors.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCatName('');
                    setCatSlug('');
                    setActiveTab('add-category');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] rounded-md transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Category</span>
                </button>
              </div>

              <div className="border border-[#222226] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181C] text-[#8E8E93] font-mono border-b border-[#222226]">
                    <tr>
                      <th className="p-3">Category Name</th>
                      <th className="p-3">URL Slug</th>
                      <th className="p-3">Products</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222226]">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-[#1A1A1E] transition-colors">
                        <td className="p-3 font-semibold text-[#F5F3EF]">
                          {cat.name}
                        </td>
                        <td className="p-3 font-mono text-[#E7A96B]">
                          /{cat.slug}
                        </td>
                        <td className="p-3">
                          <span className="font-mono bg-[#1E1E22] text-[#A1A1AA] px-2 py-0.5 rounded border border-[#2A2A2E]">
                            {cat.product_count || 0} items
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setCatName(cat.name);
                                setCatSlug(cat.slug);
                                setActiveTab('add-category');
                              }}
                              className="p-1.5 text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#25252A] rounded transition-colors"
                              title="Edit Category Name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'category',
                                  id: cat.id,
                                  name: cat.name,
                                })
                              }
                              className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADD / EDIT PRODUCT */}
          {activeTab === 'add-product' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl p-6 space-y-6">
              <div className="border-b border-[#222226] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#F5F3EF]">
                    {editingProductId ? 'Edit 3D Product' : 'Add New 3D Printed Product'}
                  </h2>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Images are stored in the Supabase &ldquo;product-images&rdquo; storage bucket.
                  </p>
                </div>
                {editingProductId && (
                  <button
                    onClick={resetProductForm}
                    className="text-xs text-[#E7A96B] hover:underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lotus Amber Tea Light"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3 py-2 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3 py-2 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (/{c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload Area with Drag & Drop Preview */}
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Product Image * (JPG, PNG, WebP &lt; 8MB)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2C2C32] hover:border-[#E7A96B]/60 bg-[#161619] rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {imagePreviewUrl ? (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="w-28 h-28 rounded-lg overflow-hidden border border-[#3E3E46] bg-[#0E0E10] shrink-0">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left space-y-1">
                          <div className="text-xs font-semibold text-[#F5F3EF]">
                            {imageFile ? imageFile.name : 'Existing Product Image'}
                          </div>
                          {imageFile && (
                            <div className="text-[11px] text-[#71717A] font-mono">
                              {(imageFile.size / (1024 * 1024)).toFixed(2)} MB · {imageFile.type}
                            </div>
                          )}
                          <p className="text-[11px] text-[#E7A96B]">Click to replace image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-[#E7A96B] mx-auto opacity-80" />
                        <div className="text-xs text-[#F5F3EF] font-medium">
                          Click to select or drag a product photo
                        </div>
                        <div className="text-[11px] text-[#71717A] font-mono">
                          JPG, PNG, or WebP up to 8MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Short Description (Subtitle / Summary)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Translucent PETG ambient table luminaire with 0.12mm layers"
                    value={prodShortDesc}
                    onChange={(e) => setProdShortDesc(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3 py-2 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Full Product Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide full storytelling, material details, dimensions, and layer infill specs..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3 py-2 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center gap-3 bg-[#18181C] border border-[#27272A] p-3 rounded-lg">
                    <input
                      type="checkbox"
                      id="featCheck"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#E7A96B] rounded cursor-pointer"
                    />
                    <label htmlFor="featCheck" className="text-xs text-[#F5F3EF] cursor-pointer">
                      <strong>Featured Product</strong>
                      <span className="block text-[11px] text-[#71717A]">
                        Highlights item in the main hero and trending carousels
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-[#18181C] border border-[#27272A] p-3 rounded-lg">
                    <div>
                      <span className="text-xs text-[#F5F3EF] font-bold block">Status</span>
                      <span className="text-[11px] text-[#71717A]">
                        {prodStatus === 'active' ? 'Visible to public' : 'Saved as draft'}
                      </span>
                    </div>
                    <select
                      value={prodStatus}
                      onChange={(e) => setProdStatus(e.target.value as any)}
                      className="bg-[#141416] text-[#F5F3EF] border border-[#2D2D32] rounded px-2.5 py-1 text-xs"
                    >
                      <option value="active">Active (Published)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 bg-[#1A1A1E] text-[#A1A1AA] hover:text-[#FFFFFF] text-xs font-semibold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="px-6 py-2.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmittingProduct ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
                        <span>Uploading & Saving...</span>
                      </>
                    ) : (
                      <span>{editingProductId ? 'Update Product' : 'Publish Product'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: ADD / EDIT CATEGORY */}
          {activeTab === 'add-category' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl p-6 space-y-5 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-[#F5F3EF]">
                  {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Categories dynamically appear on the public website horizontal carousels.
                </p>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sculptural Planters"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3 py-2 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Custom Slug (Optional — auto-generated if left empty)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sculptural-planters"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3 py-2 text-xs font-mono text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="px-4 py-2 bg-[#1A1A1E] text-[#A1A1AA] hover:text-[#FFFFFF] text-xs font-semibold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCat}
                    className="px-5 py-2 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs rounded transition-colors cursor-pointer"
                  >
                    {isSubmittingCat ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: SUPABASE SQL & DATABASE SETUP */}
          {activeTab === 'database' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#F5F3EF]">Supabase SQL Migration & Policy Script</h2>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Run this SQL script in your Supabase project (Dashboard -&gt; SQL Editor) to provision tables, RLS policies, and default categories.
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    showNotification('success', 'SQL script copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-semibold text-xs rounded transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </button>
              </div>

              <div className="bg-[#0C0C0E] border border-[#242428] rounded-lg p-4 font-mono text-[11px] text-[#A1A1AA] overflow-x-auto max-h-[400px]">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal for Deletions */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161619] border border-[#2B2B30] rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F5F3EF]">
                Confirm Delete {deleteConfirmation.type === 'product' ? 'Product' : 'Category'}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                Are you sure you want to permanently delete &ldquo;<strong className="text-[#F5F3EF]">{deleteConfirmation.name}</strong>&rdquo;? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-3.5 py-2 bg-[#1C1C20] text-[#A1A1AA] hover:text-[#FFFFFF] text-xs font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
