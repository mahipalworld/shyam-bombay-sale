'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Plus, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Sparkles,
  Upload,
  Image as ImageIcon,
  Home,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  Package,
  Palette
} from 'lucide-react';
import { Category } from '@/types';

const SAMPLE_CATEGORY_IMAGES = [
  { label: 'Cleaning', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80' },
  { label: 'Kitchen', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Grooming', url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Storage', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80' },
  { label: 'Home Decor', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Laundry', url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Travel', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Deals/Offers', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80' },
];

const PASTEL_PALETTE = [
  { name: 'Sky Blue', bg: '#EAF4FC', accent: '#0284C7' },
  { name: 'Warm Peach', bg: '#FFF0E6', accent: '#EA580C' },
  { name: 'Soft Purple', bg: '#F3EFFC', accent: '#9333EA' },
  { name: 'Mint Green', bg: '#EBF5F0', accent: '#059669' },
  { name: 'Sunny Gold', bg: '#FFF9E6', accent: '#D97706' },
  { name: 'Rose Pink', bg: '#FDEEF2', accent: '#DB2777' },
  { name: 'Ice Teal', bg: '#EDF5F9', accent: '#0891B2' },
  { name: 'Neutral Slate', bg: '#F1F5F9', accent: '#475569' },
];

export const CategoriesView: React.FC = () => {
  const { 
    categories, 
    products, 
    homepageCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    reorderCategories, 
    showToast 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBgColor, setFormBgColor] = useState('#EAF4FC');
  const [formAccentColor, setFormAccentColor] = useState('#0284C7');
  const [formShowOnHome, setFormShowOnHome] = useState(true);
  const [formSubcategories, setFormSubcategories] = useState<{ id: string; name: string; subtitle?: string; itemCount?: number }[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubSubtitle, setNewSubSubtitle] = useState('');

  // Counts
  const totalCategories = categories.length;
  const homeCategoriesCount = categories.filter(c => {
    if (c.showOnHome !== undefined) return c.showOnHome;
    return homepageCategories.includes(c.id);
  }).length;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSubtitle('Everyday essentials');
    setFormImage('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80');
    setFormBgColor('#EAF4FC');
    setFormAccentColor('#0284C7');
    setFormShowOnHome(true);
    setFormSubcategories([]);
    setNewSubName('');
    setNewSubSubtitle('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSubtitle(c.subtitle || '');
    setFormImage(c.image);
    setFormBgColor(c.bgColor || '#EAF4FC');
    setFormAccentColor(c.accentColor || '#0284C7');
    setFormShowOnHome(c.showOnHome !== undefined ? c.showOnHome : homepageCategories.includes(c.id));
    setFormSubcategories(c.subcategories ? [...c.subcategories] : []);
    setNewSubName('');
    setNewSubSubtitle('');
    setIsModalOpen(true);
  };

  const handleAddSubcategory = () => {
    if (!newSubName.trim()) return;
    const slug = newSubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newSub = {
      id: slug || `sub-${Date.now()}`,
      name: newSubName.trim(),
      subtitle: newSubSubtitle.trim() || undefined,
    };
    setFormSubcategories([...formSubcategories, newSub]);
    setNewSubName('');
    setNewSubSubtitle('');
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormSubcategories(formSubcategories.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }
    if (!formImage.trim()) {
      showToast('Please provide an image for the category', 'error');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        image: formImage.trim(),
        bgColor: formBgColor,
        accentColor: formAccentColor,
        showOnHome: formShowOnHome,
        subcategories: formSubcategories,
      });
      showToast(`Category "${formName}" updated successfully!`);
    } else {
      addCategory({
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        image: formImage.trim(),
        bgColor: formBgColor,
        accentColor: formAccentColor,
        showOnHome: formShowOnHome,
        subcategories: formSubcategories,
      });
      showToast(`Category "${formName}" created!`);
    }
    setIsModalOpen(false);
  };

  const handleToggleHomepageVisibility = (c: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = c.showOnHome !== undefined ? c.showOnHome : homepageCategories.includes(c.id);
    const nextStatus = !currentStatus;
    updateCategory(c.id, { showOnHome: nextStatus });
    showToast(`Category "${c.name}" is now ${nextStatus ? 'visible on' : 'hidden from'} homepage!`);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[index - 1];
    newCats[index - 1] = temp;
    reorderCategories(newCats.map(c => c.id));
    showToast('Storefront category display order updated!');
  };

  const handleMoveDown = (index: number) => {
    if (index >= categories.length - 1) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[index + 1];
    newCats[index + 1] = temp;
    reorderCategories(newCats.map(c => c.id));
    showToast('Storefront category display order updated!');
  };

  return (
    <div className="space-y-5 pb-28 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
              Categories & Catalog Taxonomy
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage category titles, photos/images, pastel colors, and control storefront homepage visibility.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400">Total Categories</span>
          <p className="text-xl font-black text-gray-900 mt-0.5">{totalCategories}</p>
          <span className="text-[10px] text-gray-500">Live store taxonomy</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400">Homepage Active</span>
          <p className="text-xl font-black text-[#F95721] mt-0.5">{homeCategoriesCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Featured on Home</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400">Catalog Products</span>
          <p className="text-xl font-black text-gray-900 mt-0.5">{products.length}</p>
          <span className="text-[10px] text-gray-500">Assigned across categories</span>
        </div>
      </div>

      {/* Search & Info Banner */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#F95721] shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-auto bg-orange-50/80 border border-orange-200/70 rounded-2xl px-3.5 py-2 text-xs text-orange-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F95721] flex-shrink-0" />
          <span className="text-[11px]">
            Use the <strong>🏠 Homepage Switch</strong> or <strong>Edit</strong> button to customize images and storefront appearance.
          </span>
        </div>
      </div>

      {/* Responsive Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredCategories.map((c, index) => {
          const isHomeVisible = c.showOnHome !== undefined ? c.showOnHome : homepageCategories.includes(c.id);
          const productCount = products.filter(p => p.category === c.id).length;

          return (
            <div
              key={c.id}
              className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
            >
              {/* Card Top Row */}
              <div className="flex items-start gap-3">
                {/* Category Thumbnail with custom background */}
                <div 
                  className="w-16 h-16 rounded-2xl p-1.5 flex items-center justify-center flex-shrink-0 border border-black/5 shadow-2xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: c.bgColor || '#F3F4F6' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={c.image} 
                    alt={c.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black text-gray-900 capitalize truncate">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                      #{index + 1}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    {c.subtitle || 'Everyday essentials'}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-400" />
                      {productCount} items
                    </span>

                    {/* Pastel Swatch */}
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" 
                      style={{ backgroundColor: c.bgColor }}
                      title={`Theme: ${c.bgColor}`}
                    />
                  </div>

                  {/* Subcategories list preview */}
                  {c.subcategories && c.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom Row: Controls & Quick Toggles */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                {/* Homepage Visibility One-Click Toggle */}
                <button
                  type="button"
                  onClick={(e) => handleToggleHomepageVisibility(c, e)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    isHomeVisible 
                      ? 'bg-orange-50 text-[#F95721] hover:bg-orange-100 border border-orange-200/60' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-transparent'
                  }`}
                  title="Click to toggle display on homepage"
                >
                  <Home className="w-3 h-3" />
                  <span>{isHomeVisible ? 'On Homepage' : 'Hidden'}</span>
                </button>

                {/* Right: Order Handles & Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Up / Down Reorder */}
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1 rounded-lg hover:bg-white text-gray-600 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === categories.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1 rounded-lg hover:bg-white text-gray-600 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${c.name}"? Products in this category will be preserved.`)) {
                        deleteCategory(c.id);
                      }
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <span className="text-[10px] font-black text-[#F95721] uppercase tracking-wider">
                  {editingCategory ? 'Edit Mode' : 'New Taxonomy Item'}
                </span>
                <h2 className="text-sm font-black text-gray-900">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Store Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200/80 text-gray-600 hover:text-black flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Category Name */}
              <div>
                <label className="block font-bold text-gray-800 mb-1 text-xs">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen Utilities"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-bold text-gray-900"
                />
              </div>

              {/* Subtitle / Tagline */}
              <div>
                <label className="block font-bold text-gray-800 mb-1 text-xs">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Storage, Bottles, Tools & more"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs text-gray-800"
                />
              </div>

              {/* HOMEPAGE VISIBILITY TOGGLE */}
              <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-[#F95721]" />
                    <span className="font-extrabold text-xs text-gray-900">Show on Homepage Carousel</span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    When enabled, this category is shown directly on the customer homepage &quot;Shop by Category&quot; section.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formShowOnHome}
                    onChange={(e) => setFormShowOnHome(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F95721]" />
                </label>
              </div>

              {/* CATEGORY IMAGE MANAGEMENT */}
              <div className="space-y-2.5">
                <label className="block font-bold text-gray-800 text-xs">
                  Category Image & Photo <span className="text-red-500">*</span>
                </label>

                {/* File Upload Button */}
                <label className="border-2 border-dashed border-orange-300 hover:border-[#F95721] bg-orange-50/40 hover:bg-orange-50 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          showToast('Please select a valid image file', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setFormImage(event.target.result as string);
                            showToast(`Image "${file.name}" uploaded successfully! 📸`);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F95721] group-hover:scale-110 flex items-center justify-center transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Upload Image from Device / Phone</p>
                    <p className="text-[10px] text-gray-500">Supports JPG, PNG, WEBP, SVG</p>
                  </div>
                  <span className="px-3 py-1 bg-[#F95721] text-white text-[10px] font-bold rounded-xl shadow-xs">
                    Choose Photo
                  </span>
                </label>

                {/* Live Preview Box */}
                <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/80 flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-2xl p-1.5 border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden"
                    style={{ backgroundColor: formBgColor }}
                  >
                    {formImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formImage} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">Active Image Preview</span>
                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {formImage.startsWith('data:') ? '✅ Custom Uploaded Image' : formImage || 'No image set yet'}
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Or Enter Image URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImage.startsWith('data:') ? '' : formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-3.5 py-2 outline-none focus:border-[#F95721] text-xs"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                    Or Pick from High-Quality Presets:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_CATEGORY_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setFormImage(preset.url)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          formImage === preset.url 
                            ? 'border-[#F95721] bg-orange-50/80 shadow-xs' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-700 truncate w-full text-center">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PASTEL CARD THEME COLOR */}
              <div>
                <label className="block font-bold text-gray-800 mb-1.5 text-xs">
                  Card Pastel Background Theme
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PASTEL_PALETTE.map((pal) => (
                    <button
                      type="button"
                      key={pal.bg}
                      onClick={() => {
                        setFormBgColor(pal.bg);
                        setFormAccentColor(pal.accent);
                      }}
                      className={`h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                        formBgColor === pal.bg 
                          ? 'border-[#F95721] scale-110 shadow-xs ring-2 ring-orange-200' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: pal.bg }}
                      title={pal.name}
                    >
                      {formBgColor === pal.bg && <Check className="w-3.5 h-3.5 text-gray-800" />}
                    </button>
                  ))}
                </div>

                {/* Custom Hex Code Option */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={formBgColor.startsWith('#') && formBgColor.length === 7 ? formBgColor : '#EAF4FC'}
                    onChange={(e) => setFormBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formBgColor}
                    onChange={(e) => setFormBgColor(e.target.value)}
                    placeholder="#EAF4FC"
                    className="w-28 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-mono"
                  />
                  <span className="text-[10px] text-gray-500">Custom background hex</span>
                </div>
              </div>

              {/* SUBCATEGORIES / SUB-SECTIONS MANAGER */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#F95721]" />
                    <span className="font-extrabold text-xs text-gray-900">Sub-Categories / Sub-Sections</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {formSubcategories.length} configured
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">
                  Sub-sections group products in this category (e.g., Decor, Mats, Lightings, Tools).
                </p>

                {/* Existing Subcategories List */}
                {formSubcategories.length > 0 && (
                  <div className="space-y-1.5">
                    {formSubcategories.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-xs text-gray-900">{sub.name}</span>
                          {sub.subtitle && (
                            <span className="text-[10px] text-gray-400 ml-1.5 truncate">
                              ({sub.subtitle})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(idx)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove subcategory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Subcategory Mini Form */}
                <div className="pt-2 border-t border-gray-200/60 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Subcategory Name (e.g. Decor)"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#F95721]"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle (e.g. Vases, accents)"
                      value={newSubSubtitle}
                      onChange={(e) => setNewSubSubtitle(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#F95721]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    disabled={!newSubName.trim()}
                    className="w-full py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sub-Category</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#F95721] hover:bg-[#E44813] text-white font-black rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
