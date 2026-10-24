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
  BookOpen,
  Key,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Paperclip,
  Check,
  Send,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Images,
  Image as ImageIcon,
} from 'lucide-react';
import { CategoryRecord, ProductRecord, CustomerEnquiry } from '../../types';
import {
  fetchCategories,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadProductImage,
} from '../../services/productService';
import {
  fetchEnquiries,
  updateEnquiryStatus,
  updateEnquiryNotes,
  deleteEnquiry,
} from '../../services/enquiryService';
import { signOutAdmin } from '../../services/authService';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured, getProductImageUrl } from '../../lib/supabase';
import { formatPriceINR } from '../../lib/config';
import {
  validateImageFiles,
  reorderImages,
  removeImageAtIndex,
} from '../../utils/galleryLogic';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewPortfolio: () => void;
  adminEmail?: string;
}

type TabType = 'overview' | 'products' | 'categories' | 'enquiries' | 'add-product' | 'add-category' | 'database' | 'guide';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onViewPortfolio,
  adminEmail,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add / Edit Product Form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodStatus, setProdStatus] = useState<'active' | 'draft'>('active');
  // Multi-image state for product form
  const [productImages, setProductImages] = useState<Array<{
    id: string;
    type: 'existing' | 'new';
    previewUrl: string;
    file?: File;
    path?: string;
    name: string;
    size?: number;
  }>>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Add / Edit Category Form state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category' | 'enquiry';
    id: string;
    name: string;
    imagePath?: string;
    imagePaths?: string[];
  } | null>(null);

  // Customer Enquiries Management state
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);
  const [enquiryNotesInput, setEnquiryNotesInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Search in products table
  const [productSearch, setProductSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods, enqs] = await Promise.all([
        fetchCategories(),
        fetchProducts({ status: 'all' }),
        fetchEnquiries(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setEnquiries(enqs);
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

  // Add files to product images state with format and size validation
  const handleAddFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const validation = validateImageFiles(fileArray);
    if (!validation.valid) {
      showNotification('error', validation.error || 'Invalid image file.');
      return;
    }

    const newItems = fileArray.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'new' as const,
      previewUrl: URL.createObjectURL(file),
      file,
      name: file.name,
      size: file.size,
    }));

    setProductImages((prev) => [...prev, ...newItems]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveProductImage = (index: number) => {
    setProductImages((prev) => removeImageAtIndex(prev, index));
  };

  const handleMoveProductImage = (fromIndex: number, toIndex: number) => {
    setProductImages((prev) => reorderImages(prev, fromIndex, toIndex));
  };

  // Open Edit Product Modal / Form
  const startEditProduct = (product: ProductRecord) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdCategory(product.category_id);
    setProdPrice(product.price !== undefined && product.price !== null ? String(product.price) : '');
    setProdShortDesc(product.short_description || '');
    setProdDesc(product.description || '');
    setProdFeatured(product.is_featured);
    setProdStatus(product.status);

    const rawImages: string[] =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images.filter(Boolean)
        : product.image_path
        ? [product.image_path]
        : [];

    const existingItems = rawImages.map((path, idx) => ({
      id: `existing-${idx}-${path}`,
      type: 'existing' as const,
      path,
      previewUrl: getProductImageUrl(path),
      name: path.split('/').pop() || `Photo ${idx + 1}`,
    }));

    setProductImages(existingItems);
    setUploadProgress(null);
    setActiveTab('add-product');
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdShortDesc('');
    setProdDesc('');
    setProdFeatured(false);
    setProdStatus('active');
    setProductImages([]);
    setUploadProgress(null);
    if (categories.length > 0) {
      setProdCategory(categories[0].id);
    }
  };

  // Handle Save Product (Create or Edit) with persistent image ordering
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

    if (productImages.length === 0) {
      showNotification('error', 'Please upload at least one product photo.');
      return;
    }

    let parsedPrice: number | null = null;
    if (prodPrice.trim() !== '') {
      const num = parseFloat(prodPrice.trim());
      if (isNaN(num) || num < 0) {
        showNotification('error', 'Product price must be a valid non-negative number.');
        return;
      }
      parsedPrice = Math.round(num * 100) / 100;
    }

    setIsSubmittingProduct(true);
    setUploadProgress(null);
    try {
      // 1. Upload any newly added files first, reporting progress
      const newItems = productImages.filter((p) => p.type === 'new' && p.file);
      const uploadedMap = new Map<string, string>();

      if (newItems.length > 0) {
        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i];
          setUploadProgress({ current: i + 1, total: newItems.length });
          const storagePath = await uploadProductImage(item.file!);
          uploadedMap.set(item.id, storagePath);
        }
      }

      // 2. Assemble final ordered paths in the EXACT order shown in the dashboard UI
      const finalOrderedPaths: string[] = productImages
        .map((item) => (item.type === 'new' ? uploadedMap.get(item.id) : item.path))
        .filter((p): p is string => Boolean(p));

      if (finalOrderedPaths.length === 0) {
        throw new Error('No valid images could be saved.');
      }

      if (editingProductId) {
        await updateProduct(
          editingProductId,
          {
            name: prodName,
            price: parsedPrice,
            short_description: prodShortDesc,
            description: prodDesc,
            category_id: prodCategory,
            is_featured: prodFeatured,
            status: prodStatus,
          },
          null,
          finalOrderedPaths
        );
        showNotification('success', `Product "${prodName}" updated with ${finalOrderedPaths.length} photo${finalOrderedPaths.length > 1 ? 's' : ''}.`);
      } else {
        await createProduct(
          {
            name: prodName,
            price: parsedPrice,
            short_description: prodShortDesc,
            description: prodDesc,
            category_id: prodCategory,
            is_featured: prodFeatured,
            status: prodStatus,
          },
          null,
          finalOrderedPaths
        );
        showNotification('success', `Product "${prodName}" created with ${finalOrderedPaths.length} photo${finalOrderedPaths.length > 1 ? 's' : ''}.`);
      }

      resetProductForm();
      setActiveTab('products');
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save product.');
    } finally {
      setIsSubmittingProduct(false);
      setUploadProgress(null);
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
        await deleteProduct(deleteConfirmation.id, deleteConfirmation.imagePaths || deleteConfirmation.imagePath);
        showNotification('success', `Product "${deleteConfirmation.name}" deleted.`);
      } else if (deleteConfirmation.type === 'category') {
        await deleteCategory(deleteConfirmation.id);
        showNotification('success', `Category "${deleteConfirmation.name}" deleted.`);
      } else if (deleteConfirmation.type === 'enquiry') {
        await deleteEnquiry(deleteConfirmation.id, deleteConfirmation.imagePath);
        showNotification('success', `Enquiry from "${deleteConfirmation.name}" deleted.`);
        if (selectedEnquiry && selectedEnquiry.id === deleteConfirmation.id) {
          setSelectedEnquiry(null);
        }
      }
      setDeleteConfirmation(null);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Deletion failed.');
    }
  };

  // Handle Enquiry Status Update
  const handleUpdateEnquiryStatus = async (
    enquiryId: string,
    newStatus: 'new' | 'in_progress' | 'completed'
  ) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateEnquiryStatus(enquiryId, newStatus);
      setEnquiries((prev) => prev.map((e) => (e.id === enquiryId ? updated : e)));
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(updated);
      }
      showNotification('success', `Enquiry status changed to "${newStatus.replace('_', ' ').toUpperCase()}".`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update enquiry status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Enquiry Internal Notes Update
  const handleSaveEnquiryNotes = async (enquiryId: string) => {
    setIsSavingNotes(true);
    try {
      const updated = await updateEnquiryNotes(enquiryId, enquiryNotesInput);
      setEnquiries((prev) => prev.map((e) => (e.id === enquiryId ? updated : e)));
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(updated);
      }
      showNotification('success', 'Admin internal notes saved successfully.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save admin notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleOpenEnquiryModal = (enquiry: CustomerEnquiry) => {
    setSelectedEnquiry(enquiry);
    setEnquiryNotesInput(enquiry.admin_notes || '');
  };

  // Filtered Enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = enquiryStatusFilter === 'all' || e.status === enquiryStatusFilter;
    const query = enquirySearch.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      e.customer_name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      (e.phone || '').toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      (e.project_category || '').toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

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
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-transparent flex items-center justify-center p-0.5">
              <img
                src="/assets/aistudio/Glossy_AV_Creations_Mascot_Emblem_e418bb80.png"
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
        {/* Navigation Sidebar (3 Cols) */}
        <aside className="md:col-span-3 bg-[#141416] border border-[#222226] rounded-xl p-3 space-y-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package, badge: products.length },
            { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
            {
              id: 'enquiries',
              label: 'Customer Enquiries',
              icon: MessageSquare,
              badge: newEnquiriesCount > 0 ? `${newEnquiriesCount} New` : enquiries.length,
            },
            { id: 'add-product', label: editingProductId ? 'Edit Product' : 'Add Product', icon: PlusCircle },
            { id: 'add-category', label: 'Add Category', icon: PlusCircle },
            { id: 'database', label: 'Supabase SQL Setup', icon: Database },
            { id: 'guide', label: 'Admin & Setup Guide', icon: BookOpen },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div
                  onClick={() => setActiveTab('enquiries')}
                  className="bg-[#141416] border border-[#222226] hover:border-[#E7A96B]/50 p-5 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                  title="View Customer Enquiries"
                >
                  <div>
                    <span className="text-xs font-mono text-[#8E8E93] uppercase group-hover:text-[#E7A96B] transition-colors">
                      Customer Enquiries
                    </span>
                    <div className="text-2xl font-extrabold text-[#F5F3EF] mt-1 font-mono flex items-center gap-2">
                      <span>{enquiries.length}</span>
                      {newEnquiriesCount > 0 && (
                        <span className="text-[11px] font-sans font-bold bg-[#E7A96B]/20 text-[#E7A96B] px-2 py-0.5 rounded-full border border-[#E7A96B]/30">
                          {newEnquiriesCount} New
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1">
                      Custom print briefs received
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#1E1E22] group-hover:bg-[#E7A96B]/15 flex items-center justify-center text-[#E7A96B] transition-colors">
                    <MessageSquare className="w-5 h-5" />
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
                    onClick={() => setActiveTab('enquiries')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F5F3EF] bg-[#1E1E22] hover:bg-[#28282E] border border-[#2D2D32] rounded-md transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>Customer Enquiries ({newEnquiriesCount} New)</span>
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
                          <th className="p-3">Price</th>
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
                            <td className="p-3 font-mono text-[#E7A96B]">
                              {prod.price != null ? (
                                formatPriceINR(prod.price)
                              ) : (
                                <span className="text-[#71717A] text-[10px] italic">On Request</span>
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
                                      imagePaths: prod.images && prod.images.length > 0 ? prod.images : [prod.image_path],
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
                        <th className="p-3">Price</th>
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
                          <td className="p-3 font-mono font-medium text-[#E7A96B]">
                            {prod.price != null ? (
                              formatPriceINR(prod.price)
                            ) : (
                              <span className="text-[#71717A] text-[11px] font-normal italic">
                                Price on request
                              </span>
                            )}
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
                                    imagePaths: prod.images && prod.images.length > 0 ? prod.images : [prod.image_path],
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

          {/* TAB: CUSTOMER ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl overflow-hidden space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#F5F3EF]">Customer Enquiries</h2>
                    {newEnquiriesCount > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-[#E7A96B]/20 text-[#E7A96B] px-2 py-0.5 rounded-full border border-[#E7A96B]/30">
                        {newEnquiriesCount} New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Review and manage custom 3D printing requests submitted through the website form.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#FFFFFF] bg-[#1A1A1E] hover:bg-[#25252A] border border-[#2A2A2E] rounded-md transition-colors cursor-pointer self-start sm:self-auto"
                  title="Refresh Enquiries"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex-1 min-w-[240px] relative">
                  <input
                    type="text"
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    placeholder="Search by customer name, email, phone, or description..."
                    className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5 pointer-events-none" />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-[#18181C] p-1 rounded-lg border border-[#242428]">
                  {[
                    { id: 'all', label: 'All', count: enquiries.length },
                    { id: 'new', label: 'New', count: enquiries.filter((e) => e.status === 'new').length },
                    { id: 'in_progress', label: 'In Progress', count: enquiries.filter((e) => e.status === 'in_progress').length },
                    { id: 'completed', label: 'Completed', count: enquiries.filter((e) => e.status === 'completed').length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setEnquiryStatusFilter(filter.id as any)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        enquiryStatusFilter === filter.id
                          ? 'bg-[#E7A96B] text-[#101010] font-bold shadow-xs'
                          : 'text-[#A1A1AA] hover:text-[#F5F3EF] hover:bg-[#222228]'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        enquiryStatusFilter === filter.id ? 'bg-[#101010]/20 text-[#101010]' : 'bg-[#141416] text-[#71717A]'
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enquiries Table or Empty State */}
              {filteredEnquiries.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#71717A] space-y-3 bg-[#111113] rounded-lg border border-[#1E1E22]">
                  <MessageSquare className="w-8 h-8 text-[#444] mx-auto opacity-60" />
                  <div className="text-sm font-semibold text-[#A1A1AA]">
                    {enquirySearch || enquiryStatusFilter !== 'all'
                      ? 'No enquiries match your search or filter'
                      : 'No customer enquiries yet'}
                  </div>
                  <p className="max-w-md mx-auto text-[11px] text-[#666]">
                    {enquirySearch || enquiryStatusFilter !== 'all'
                      ? 'Try clearing your search keyword or switching the status filter back to All.'
                      : 'Submissions from the public website custom-print request form will appear here automatically.'}
                  </p>
                  {(enquirySearch || enquiryStatusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setEnquirySearch('');
                        setEnquiryStatusFilter('all');
                      }}
                      className="px-3 py-1 bg-[#1E1E22] hover:bg-[#28282E] text-xs text-[#E7A96B] rounded transition-colors"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#222226] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18181C] text-[#8E8E93] font-mono border-b border-[#222226]">
                      <tr>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Project Brief</th>
                        <th className="p-3">Reference / File</th>
                        <th className="p-3">Submitted</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222226]">
                      {filteredEnquiries.map((enq) => (
                        <tr key={enq.id} className="hover:bg-[#1A1A1E] transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-[#F5F3EF]">
                              {enq.customer_name}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] text-[#A1A1AA]">
                              <a
                                href={`mailto:${enq.email}`}
                                className="inline-flex items-center gap-1 hover:text-[#E7A96B] transition-colors"
                              >
                                <Mail className="w-3 h-3 text-[#71717A]" />
                                <span>{enq.email}</span>
                              </a>
                              {enq.phone && (
                                <a
                                  href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-400/90 hover:text-emerald-300 transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <Phone className="w-3 h-3 text-emerald-500" />
                                  <span>{enq.phone}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-3 max-w-[280px]">
                            {enq.project_category && (
                              <span className="inline-block text-[10px] font-mono bg-[#1E1E22] text-[#E7A96B] px-1.5 py-0.5 rounded border border-[#2A2A2E] mb-1">
                                {enq.project_category}
                              </span>
                            )}
                            <p className="text-[#A1A1AA] line-clamp-2 leading-relaxed">
                              {enq.description}
                            </p>
                            {enq.admin_notes && (
                              <div className="mt-1 text-[10px] text-[#71717A] italic flex items-center gap-1">
                                <span className="font-semibold text-[#A1A1AA]">Note:</span>
                                <span className="truncate max-w-[200px]">{enq.admin_notes}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              {enq.attachment_url ? (
                                <a
                                  href={enq.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-[#E7A96B] hover:underline"
                                  title={enq.attachment_name || 'View Attachment'}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">
                                    {enq.attachment_name || 'Attachment'}
                                  </span>
                                </a>
                              ) : null}
                              {enq.reference_link ? (
                                <a
                                  href={enq.reference_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-[#F5F3EF]"
                                >
                                  <ExternalLink className="w-3 h-3 text-[#71717A]" />
                                  <span>Reference Link</span>
                                </a>
                              ) : null}
                              {!enq.attachment_url && !enq.reference_link && (
                                <span className="text-[#555] font-mono text-[11px]">—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-[#71717A] font-mono text-[11px] whitespace-nowrap">
                            {enq.created_at ? (
                              <>
                                <div>{new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                <div className="text-[10px] text-[#555]">
                                  {new Date(enq.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </>
                            ) : (
                              'Recent'
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <select
                              value={enq.status}
                              onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as any)}
                              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold border cursor-pointer focus:outline-none ${
                                enq.status === 'new'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                                  : enq.status === 'in_progress'
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEnquiryModal(enq)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E1E22] hover:bg-[#28282E] text-[#F5F3EF] hover:text-[#E7A96B] rounded text-xs transition-colors cursor-pointer border border-[#2D2D32]"
                                title="View Complete Enquiry Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'enquiry',
                                    id: enq.id,
                                    name: `${enq.customer_name}'s enquiry`,
                                    imagePath: enq.attachment_url || undefined,
                                  })
                                }
                                className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                title="Delete Enquiry"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Price in INR (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-semibold text-[#E7A96B] font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 350 (Empty = On request)"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-[#18181C] border border-[#27272A] rounded-md pl-7 pr-3 py-2 text-xs font-mono text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Multiple Images Upload & Gallery Arrangement */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-[#A1A1AA]">
                      Product Photos * <span className="text-[#71717A]">(First photo is the primary store thumbnail)</span>
                    </label>
                    {productImages.length > 0 && (
                      <span className="text-[11px] font-mono text-[#E7A96B]">
                        {productImages.length} photo{productImages.length > 1 ? 's' : ''} in gallery
                      </span>
                    )}
                  </div>

                  {/* Dropzone with Drag & Drop and Multiple Selection */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleAddFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-[#E7A96B] bg-[#E7A96B]/10 shadow-inner'
                        : 'border-[#2C2C32] hover:border-[#E7A96B]/60 bg-[#161619]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#1C1C20] border border-[#2A2A2E] flex items-center justify-center mx-auto text-[#E7A96B]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-[#F5F3EF] font-medium">
                        Click to select or drag & drop multiple product photos
                      </div>
                      <div className="text-[11px] text-[#71717A] font-mono">
                        Select multiple files at once · JPG, PNG, or WebP up to 8MB each
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress Bar (during saving) */}
                  {uploadProgress && (
                    <div className="bg-[#18181C] border border-[#2A2A2E] rounded-lg p-3 space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#F5F3EF]">Uploading photos to Supabase Storage...</span>
                        <span className="text-[#E7A96B] font-bold">
                          {uploadProgress.current} / {uploadProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-[#101012] h-2 rounded-full overflow-hidden border border-[#27272A]">
                        <div
                          className="bg-[#E7A96B] h-full transition-all duration-300 ease-out"
                          style={{
                            width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Photo Preview & Reordering Grid */}
                  {productImages.length > 0 && (
                    <div className="bg-[#141416] border border-[#242428] rounded-xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222226] pb-2.5">
                        <div className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                          <Images className="w-3.5 h-3.5 text-[#E7A96B]" />
                          <span>Image Order & Gallery Strip Preview</span>
                          <span className="text-[11px] text-[#71717A] hidden sm:inline">
                            (Use arrows to reorder. Photo #1 is the primary store thumbnail)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#1E1E22] hover:bg-[#28282E] text-[#E7A96B] hover:text-[#F5F3EF] rounded border border-[#2E2E34] transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Add More Photos</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {productImages.map((img, idx) => {
                          const isPrimary = idx === 0;
                          return (
                            <div
                              key={img.id}
                              className={`group relative rounded-lg overflow-hidden border-2 bg-[#0E0E10] flex flex-col transition-all ${
                                isPrimary
                                  ? 'border-[#E7A96B] ring-2 ring-[#E7A96B]/20 shadow-lg shadow-[#E7A96B]/5'
                                  : 'border-[#27272A] hover:border-[#3E3E46]'
                              }`}
                            >
                              {/* Image Preview */}
                              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0C]">
                                <img
                                  src={img.previewUrl}
                                  alt={img.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />

                                {/* Primary Thumbnail Badge */}
                                {isPrimary ? (
                                  <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 bg-[#101012]/95 text-[#E7A96B] px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#E7A96B]/50 shadow-md">
                                    <Star className="w-3 h-3 fill-current text-[#E7A96B]" />
                                    <span>PRIMARY</span>
                                  </div>
                                ) : (
                                  <div className="absolute top-1.5 left-1.5 z-10 bg-[#101012]/80 text-[#A1A1AA] px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#2D2D32]">
                                    #{idx + 1}
                                  </div>
                                )}

                                {/* Delete / Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductImage(idx)}
                                  className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-[#101012]/80 hover:bg-red-950/80 text-[#A1A1AA] hover:text-red-300 border border-[#2D2D32] hover:border-red-800 transition-colors cursor-pointer"
                                  title="Remove this photo"
                                  aria-label="Remove photo"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Card Controls & Details Bar */}
                              <div className="p-2 bg-[#161619] border-t border-[#222226] flex items-center justify-between gap-1">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] font-semibold text-[#F5F3EF] truncate">
                                    {img.name}
                                  </div>
                                  <div className="text-[10px] text-[#71717A] font-mono">
                                    {img.type === 'new'
                                      ? img.size
                                        ? `${(img.size / (1024 * 1024)).toFixed(2)} MB`
                                        : 'Ready to upload'
                                      : 'Saved photo'}
                                  </div>
                                </div>

                                {/* Reorder Controls: Move Left & Move Right */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveProductImage(idx, idx - 1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded bg-[#1F1F24] hover:bg-[#2A2A30] text-[#A1A1AA] hover:text-[#FFFFFF] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    title={idx === 1 ? 'Make Primary Thumbnail' : 'Move Earlier'}
                                    aria-label="Move photo earlier"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveProductImage(idx, idx + 1)}
                                    disabled={idx === productImages.length - 1}
                                    className="p-1 rounded bg-[#1F1F24] hover:bg-[#2A2A30] text-[#A1A1AA] hover:text-[#FFFFFF] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    title="Move Later"
                                    aria-label="Move photo later"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

          {/* TAB 7: SETUP & ADMIN GUIDE */}
          {activeTab === 'guide' && (
            <div className="bg-[#141416] border border-[#222226] rounded-xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-[#222226] pb-6">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#E7A96B] uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Documentation & Operating Manual</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#F5F3EF] mt-1">
                  AV Creation Studio Administration Guide
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed max-w-3xl">
                  Complete walkthrough on configuring Supabase authentication, managing the additive manufacturing catalogue, assigning roles, and creating categories and items.
                </p>
              </div>

              {/* Guide Card 1: Admin Login Setup */}
              <div className="space-y-4 bg-[#18181C] border border-[#282830] rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E7A96B]/15 text-[#E7A96B] flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F3EF]">
                      How to Setup Administrator Login
                    </h3>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Supabase Auth integration with strict server-side role verification
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#D4D4D8] leading-relaxed pt-2">
                  <div className="flex gap-2">
                    <span className="font-mono text-[#E7A96B] font-bold">1.</span>
                    <span>
                      <strong>Run Database Schema:</strong> In your Supabase Dashboard, open <strong>SQL Editor</strong>, paste the script from the <strong>Supabase SQL Setup</strong> tab, and click <strong>Run</strong>.
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-mono text-[#E7A96B] font-bold">2.</span>
                    <span>
                      <strong>Create User in Supabase Auth:</strong> Go to <strong>Authentication -&gt; Users</strong>, click <strong>Add User</strong>, enter your admin email and password, and toggle <strong>Auto Confirm User</strong> to ON.
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-mono text-[#E7A96B] font-bold">3.</span>
                    <div className="space-y-2 flex-1">
                      <span>
                        <strong>Grant Admin Role:</strong> In your Supabase <strong>SQL Editor</strong>, run this SQL statement to authorize your email as an administrator:
                      </span>
                      <div className="bg-[#0D0D0F] border border-[#2B2B32] p-3 rounded-lg flex items-center justify-between gap-4 font-mono text-[11px] text-[#E7A96B]">
                        <code>
                          INSERT INTO public.admin_users (id, email, role, notes)<br />
                          SELECT id, email, &apos;admin&apos;, &apos;Lead Administrator&apos; FROM auth.users WHERE email = &apos;your-email@example.com&apos;<br />
                          ON CONFLICT (id) DO UPDATE SET role = &apos;admin&apos;;
                        </code>
                        <button
                          onClick={() => {
                            const sql = `INSERT INTO public.admin_users (id, email, role, notes)\nSELECT id, email, 'admin', 'Lead Administrator'\nFROM auth.users\nWHERE email = 'your-email@example.com'\nON CONFLICT (id) DO UPDATE SET role = 'admin';`;
                            navigator.clipboard.writeText(sql);
                            showNotification('success', 'Admin grant SQL copied to clipboard! Replace your-email@example.com before running.');
                          }}
                          className="shrink-0 p-2 bg-[#222228] hover:bg-[#2F2F38] text-[#F5F3EF] rounded transition-colors"
                          title="Copy SQL snippet"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-mono text-[#E7A96B] font-bold">4.</span>
                    <span>
                      <strong>Connect Keys & Log In:</strong> Provide your Supabase URL & Anon Key in <code className="text-[#E7A96B] bg-[#222228] px-1 py-0.5 rounded">.env</code> or via the connection popup, then log in at <code className="text-[#E7A96B] bg-[#222228] px-1 py-0.5 rounded">/admin/login</code>.
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide Card 2: How to Add Categories */}
              <div className="space-y-4 bg-[#18181C] border border-[#282830] rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E7A96B]/15 text-[#E7A96B] flex items-center justify-center font-bold text-xs">
                      02
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F5F3EF]">
                        How to Add and Manage Categories
                      </h3>
                      <p className="text-[11px] text-[#A1A1AA]">
                        Organize creations into carousels and filtering collections
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('add-category')}
                    className="px-3 py-1.5 bg-[#25252C] hover:bg-[#32323C] text-xs font-semibold text-[#E7A96B] rounded transition-colors cursor-pointer"
                  >
                    + New Category
                  </button>
                </div>

                <div className="space-y-2 text-xs text-[#D4D4D8] leading-relaxed pt-2">
                  <p>
                    Categories power the horizontal Netflix-style carousels on the Discovery homepage and filter tabs in the Collections Explorer.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#A1A1AA]">
                    <li>
                      <strong className="text-[#F5F3EF]">Default Categories:</strong> The 4 core collections (<em>Tea Lights</em>, <em>Clickers</em>, <em>Pokemon</em>, <em>Wall Decors</em>) are pre-configured and always appear on the public site.
                    </li>
                    <li>
                      <strong className="text-[#F5F3EF]">Category Name:</strong> Human-readable title (e.g. &ldquo;Planters &amp; Flora&rdquo; or &ldquo;Mechanical Keycaps&rdquo;).
                    </li>
                    <li>
                      <strong className="text-[#F5F3EF]">URL Slug:</strong> URL-friendly key (e.g. <code className="text-[#E7A96B]">planters-flora</code>). Automatically generated if left empty.
                    </li>
                    <li>
                      <strong className="text-[#F5F3EF]">Safe Deletion Protection:</strong> You cannot delete a category if products are still assigned to it. This prevents broken catalogue references.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Guide Card 3: How to Add Products / Items */}
              <div className="space-y-4 bg-[#18181C] border border-[#282830] rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E7A96B]/15 text-[#E7A96B] flex items-center justify-center font-bold text-xs">
                      03
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F5F3EF]">
                        How to Add and Manage Products (Items)
                      </h3>
                      <p className="text-[11px] text-[#A1A1AA]">
                        High-resolution photography, 3D technical specs, and status controls
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('add-product');
                    }}
                    className="px-3 py-1.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-xs font-semibold text-[#101010] rounded transition-colors cursor-pointer"
                  >
                    + New Product
                  </button>
                </div>

                <div className="space-y-2 text-xs text-[#D4D4D8] leading-relaxed pt-2">
                  <p>
                    Every product card highlights computational additive design, material quality, and print precision.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#A1A1AA]">
                    <li>
                      <strong className="text-[#F5F3EF]">Product Image Upload:</strong> Drag &amp; drop or browse a photo (PNG, JPG, WEBP up to 8MB). The image uploads directly to your Supabase Storage bucket (<code className="text-[#E7A96B]">product-images</code>) and is delivered via CDN.
                    </li>
                    <li>
                      <strong className="text-[#F5F3EF]">3D Technical Specs:</strong> Add material (PLA+, PETG, Silk PLA, Carbon Fiber), machine print duration (e.g. 7.5 hrs), sub-fractional layer height (e.g. 0.12mm), infill pattern, dimensions, and weight.
                    </li>
                    <li>
                      <strong className="text-[#F5F3EF]">Active vs Draft:</strong> Set status to <em>Active</em> to publish immediately, or <em>Draft</em> to keep it private while refining photos.
                    </li>
                    <li>
                      <strong className="text-[#F5F3EF]">Featured Showcase Toggle:</strong> Enable &ldquo;Feature this creation in Hero &amp; Showcase&rdquo; to spotlight it as the cinematic hero centerpiece at the top of the website.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Documentation file reference */}
              <div className="pt-4 border-t border-[#222226] flex items-center justify-between text-xs text-[#71717A] font-mono">
                <span>Offline File: ADMIN_SETUP_GUIDE.md</span>
                <span>AV Creation Studio · Additive Platform</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Complete Customer Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141416] border border-[#2B2B30] rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#222226] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#E7A96B] font-bold">
                    Custom Print Request
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      selectedEnquiry.status === 'new'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        : selectedEnquiry.status === 'in_progress'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}
                  >
                    {selectedEnquiry.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F3EF] mt-1">
                  {selectedEnquiry.customer_name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#71717A] font-mono mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#555]" />
                    {new Date(selectedEnquiry.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(selectedEnquiry.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 text-[#71717A] hover:text-[#FFFFFF] hover:bg-[#1E1E22] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact & Direct Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#18181C] border border-[#27272A] p-4 rounded-xl">
              <div>
                <span className="text-[11px] font-mono text-[#71717A] uppercase block">
                  Email Address
                </span>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="text-xs text-[#F5F3EF] hover:text-[#E7A96B] transition-colors flex items-center gap-1.5 mt-1 font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>{selectedEnquiry.email}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#71717A] uppercase block">
                  Phone / WhatsApp
                </span>
                {selectedEnquiry.phone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#F5F3EF] font-mono font-medium">
                      {selectedEnquiry.phone}
                    </span>
                    <a
                      href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#101010] bg-emerald-400 hover:bg-emerald-300 px-2 py-0.5 rounded transition-colors"
                      title="Open WhatsApp chat with customer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-[#71717A] italic mt-1 block">Not provided</span>
                )}
              </div>
            </div>

            {/* Project Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#8E8E93] font-semibold">
                Project Requirements & Description
              </h4>

              <div className="bg-[#18181C] border border-[#27272A] p-4 rounded-xl space-y-3 text-xs leading-relaxed text-[#D4D4D8]">
                {selectedEnquiry.project_category && (
                  <div className="inline-block text-[11px] font-mono bg-[#E7A96B]/15 text-[#E7A96B] px-2 py-0.5 rounded border border-[#E7A96B]/30 font-semibold">
                    Category: {selectedEnquiry.project_category}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{selectedEnquiry.description}</p>

                {/* Additional Spec Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#242428] text-[11px] font-mono">
                  {selectedEnquiry.quantity && (
                    <div className="bg-[#131315] p-2 rounded border border-[#222226]">
                      <span className="text-[#71717A] block text-[10px]">Quantity</span>
                      <span className="text-[#F5F3EF] font-bold">{selectedEnquiry.quantity} pcs</span>
                    </div>
                  )}
                  {selectedEnquiry.material_preference && (
                    <div className="bg-[#131315] p-2 rounded border border-[#222226]">
                      <span className="text-[#71717A] block text-[10px]">Material</span>
                      <span className="text-[#F5F3EF]">{selectedEnquiry.material_preference}</span>
                    </div>
                  )}
                  {selectedEnquiry.dimensions && (
                    <div className="bg-[#131315] p-2 rounded border border-[#222226]">
                      <span className="text-[#71717A] block text-[10px]">Dimensions</span>
                      <span className="text-[#F5F3EF]">{selectedEnquiry.dimensions}</span>
                    </div>
                  )}
                  {selectedEnquiry.target_timeline && (
                    <div className="bg-[#131315] p-2 rounded border border-[#222226]">
                      <span className="text-[#71717A] block text-[10px]">Target Date</span>
                      <span className="text-[#F5F3EF]">{selectedEnquiry.target_timeline}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reference File / Links */}
            {(selectedEnquiry.attachment_url || selectedEnquiry.reference_link) && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#8E8E93] font-semibold">
                  Reference Attachments & Links
                </h4>

                <div className="bg-[#18181C] border border-[#27272A] p-4 rounded-xl flex flex-wrap items-center gap-4">
                  {selectedEnquiry.attachment_url && (
                    <div className="flex items-center gap-3">
                      {selectedEnquiry.attachment_url.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                        <a
                          href={selectedEnquiry.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 rounded-lg overflow-hidden border border-[#3E3E46] shrink-0 block bg-[#101012] hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={selectedEnquiry.attachment_url}
                            alt="Attachment preview"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#24242A] border border-[#333] flex items-center justify-center text-[#E7A96B]">
                          <Paperclip className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-[#F5F3EF]">
                          {selectedEnquiry.attachment_name || 'Attached Customer File'}
                        </div>
                        <a
                          href={selectedEnquiry.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#E7A96B] hover:underline mt-0.5"
                        >
                          <span>Open / Download File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedEnquiry.reference_link && (
                    <a
                      href={selectedEnquiry.reference_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#222228] hover:bg-[#2C2C34] text-xs text-[#F5F3EF] rounded-lg transition-colors border border-[#333]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#E7A96B]" />
                      <span>View Customer Reference URL</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Update Status Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8E8E93] font-semibold">
                Update Enquiry Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'new', label: 'New', color: 'hover:border-amber-500/50' },
                  { id: 'in_progress', label: 'In Progress', color: 'hover:border-blue-500/50' },
                  { id: 'completed', label: 'Completed', color: 'hover:border-emerald-500/50' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, st.id as any)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                      selectedEnquiry.status === st.id
                        ? st.id === 'new'
                          ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                          : st.id === 'in_progress'
                          ? 'bg-blue-950/70 border-blue-500 text-blue-200'
                          : 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                        : `bg-[#18181C] border-[#2A2A2E] text-[#A1A1AA] ${st.color} hover:text-[#FFFFFF]`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-[#8E8E93] font-semibold">
                  Internal Admin Notes
                </label>
                <span className="text-[10px] text-[#71717A] font-mono">
                  Only visible to verified admins
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Log internal details, e.g.: Quoted ₹1,400 on WhatsApp, slicing with 0.12mm layers in Matte Black PLA+, expected completion Friday..."
                value={enquiryNotesInput}
                onChange={(e) => setEnquiryNotesInput(e.target.value)}
                className="w-full bg-[#18181C] border border-[#27272A] rounded-lg p-3 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNotes}
                  onClick={() => handleSaveEnquiryNotes(selectedEnquiry.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingNotes ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Internal Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="border-t border-[#222226] pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmation({
                    type: 'enquiry',
                    id: selectedEnquiry.id,
                    name: `${selectedEnquiry.customer_name}'s enquiry`,
                    imagePath: selectedEnquiry.attachment_url || undefined,
                  })
                }
                className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-[#222228] hover:bg-[#2F2F38] text-xs font-semibold text-[#F5F3EF] rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletions */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161619] border border-[#2B2B30] rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#F5F3EF]">
                Confirm Delete {deleteConfirmation.type === 'product' ? 'Product' : deleteConfirmation.type === 'category' ? 'Category' : 'Enquiry'}
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
