'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Sparkles,
  Package, 
  DollarSign, 
  Boxes, 
  FileText, 
  Globe,
  Plus,
  Trash2,
  Layers,
  Star,
  Eye
} from 'lucide-react';
import { Product, ProductDescriptionBlock } from '@/types';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct, showToast, storeSettings } = useStore();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'home',
    subcategory: '',
    shortDescription: '',
    description: '',
    image: '',
    images: [] as string[],
    descriptionBlocks: [] as ProductDescriptionBlock[],
    mrp: '',
    price: '',
    discountPercentage: 0,
    sku: '',
    stockCount: '25',
    lowStockThreshold: '5',
    stockStatus: 'In Stock',
    // Dynamic adaptive attributes
    capacity: '',
    weight: '',
    dimensions: '',
    material: '',
    color: '',
    warranty: '6 Months Replacement',
    // Publishing status
    publishStatus: 'active' as 'active' | 'draft' | 'out_of_stock',
    isTrending: false,
    isBestSeller: false,
    isDealOfDay: false,
  });

  // New Block Form State
  const [newBlock, setNewBlock] = useState<ProductDescriptionBlock>({
    title: '',
    badge: 'Feature Highlight',
    text: '',
    image: '',
  });
  const [showAddBlockForm, setShowAddBlockForm] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Calculate discount percentage automatically whenever mrp or price changes
  useEffect(() => {
    const mrpNum = parseFloat(formData.mrp);
    const priceNum = parseFloat(formData.price);
    if (mrpNum > 0 && priceNum > 0 && mrpNum >= priceNum) {
      const disc = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
      setFormData(prev => ({ ...prev, discountPercentage: disc }));
    }
  }, [formData.mrp, formData.price]);

  // Populate when editing
  useEffect(() => {
    if (productToEdit) {
      const allImgs = productToEdit.images && productToEdit.images.length > 0
        ? productToEdit.images
        : [productToEdit.image];

      setFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        subcategory: productToEdit.subcategory || '',
        shortDescription: productToEdit.description.slice(0, 80),
        description: productToEdit.description,
        image: productToEdit.image,
        images: allImgs,
        descriptionBlocks: productToEdit.descriptionBlocks || [],
        mrp: productToEdit.originalPrice.toString(),
        price: productToEdit.price.toString(),
        discountPercentage: productToEdit.discountPercentage,
        sku: `SKU-${productToEdit.id.toUpperCase()}`,
        stockCount: productToEdit.stockCount.toString(),
        lowStockThreshold: storeSettings.lowStockThreshold.toString(),
        stockStatus: productToEdit.inStock ? 'In Stock' : 'Out of Stock',
        capacity: '',
        weight: '350g',
        dimensions: '15 x 10 x 5 cm',
        material: 'Virgin Plastic / Stainless Steel',
        color: 'Pastel Slate',
        warranty: '6 Months Replacement',
        publishStatus: productToEdit.inStock ? 'active' : 'out_of_stock',
        isTrending: !!productToEdit.isTrending,
        isBestSeller: !!productToEdit.isBestSeller,
        isDealOfDay: !!productToEdit.isDealOfDay,
      });
    } else {
      // Default reset
      setFormData({
        name: '',
        category: categories[0]?.id || 'home',
        subcategory: '',
        shortDescription: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
        ],
        descriptionBlocks: [
          {
            id: 'db_default',
            title: 'High Performance & Durability',
            badge: 'Key Feature',
            text: 'Crafted with premium grade components designed for prolonged daily utility and seamless operation.',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
          }
        ],
        mrp: '999',
        price: '599',
        discountPercentage: 40,
        sku: `SKU-${Date.now().toString().slice(-5)}`,
        stockCount: '25',
        lowStockThreshold: '5',
        stockStatus: 'In Stock',
        capacity: '500 ml',
        weight: '400 g',
        dimensions: '20 x 12 x 8 cm',
        material: 'Premium ABS Plastic & Microfiber',
        color: 'Pastel Peach / White',
        warranty: '1 Year Brand Warranty',
        publishStatus: 'active',
        isTrending: false,
        isBestSeller: false,
        isDealOfDay: false,
      });
    }
    setCurrentStep(1);
  }, [productToEdit, categories, storeSettings]);

  if (!isOpen) return null;

  const totalSteps = 7;

  const stepsList = [
    { num: 1, title: 'Basic Info', icon: FileText },
    { num: 2, title: 'Gallery', icon: ImageIcon },
    { num: 3, title: 'Visual Story', icon: Layers },
    { num: 4, title: 'Pricing', icon: DollarSign },
    { num: 5, title: 'Inventory', icon: Boxes },
    { num: 6, title: 'Specs', icon: Sparkles },
    { num: 7, title: 'Publish', icon: Globe },
  ];

  const handleAddGalleryImage = (url: string) => {
    if (!url.trim()) return;
    setFormData(prev => {
      const updated = [...prev.images, url.trim()];
      return {
        ...prev,
        images: updated,
        image: prev.image || url.trim()
      };
    });
    setNewImageUrl('');
    showToast('Gallery image added! 📸');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: updated,
        image: updated.length > 0 ? (prev.image === prev.images[index] ? updated[0] : prev.image) : ''
      };
    });
  };

  const handleSetPrimaryImage = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    showToast('Set as cover image! ⭐');
  };

  const handleAddDescriptionBlock = () => {
    if (!newBlock.text.trim()) {
      showToast('Please enter description text for this section', 'error');
      return;
    }
    const blockToAdd: ProductDescriptionBlock = {
      ...newBlock,
      id: `db_${Date.now()}`
    };
    setFormData(prev => ({
      ...prev,
      descriptionBlocks: [...prev.descriptionBlocks, blockToAdd]
    }));
    setNewBlock({
      title: '',
      badge: 'Feature Highlight',
      text: '',
      image: ''
    });
    setShowAddBlockForm(false);
    showToast('Visual story block added! ✨');
  };

  const handleRemoveDescriptionBlock = (index: number) => {
    setFormData(prev => ({
      ...prev,
      descriptionBlocks: prev.descriptionBlocks.filter((_, idx) => idx !== index)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a product name', 'error');
      setCurrentStep(1);
      return;
    }
    if (!formData.price || !formData.mrp) {
      showToast('Please set selling price and MRP', 'error');
      setCurrentStep(4);
      return;
    }

    const price = parseFloat(formData.price) || 0;
    const originalPrice = parseFloat(formData.mrp) || price;
    const stockCount = parseInt(formData.stockCount) || 0;
    const inStock = formData.publishStatus !== 'out_of_stock' && stockCount > 0;
    const primaryImg = formData.image || formData.images[0] || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80';
    const allGalleryImages = formData.images.length > 0 ? formData.images : [primaryImg];

    const dynamicFeatures: string[] = [];
    if (formData.capacity) dynamicFeatures.push(`Capacity: ${formData.capacity}`);
    if (formData.material) dynamicFeatures.push(`Material: ${formData.material}`);
    if (formData.color) dynamicFeatures.push(`Color: ${formData.color}`);
    if (formData.warranty) dynamicFeatures.push(`Warranty: ${formData.warranty}`);

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        price,
        originalPrice,
        discountPercentage: formData.discountPercentage,
        image: primaryImg,
        images: allGalleryImages,
        descriptionBlocks: formData.descriptionBlocks,
        stockCount,
        inStock,
        description: formData.description || formData.shortDescription,
        features: dynamicFeatures.length > 0 ? dynamicFeatures : productToEdit.features,
        isTrending: formData.isTrending,
        isBestSeller: formData.isBestSeller,
        isDealOfDay: formData.isDealOfDay,
      });
      showToast(`Product "${formData.name}" updated successfully!`);
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        price,
        originalPrice,
        discountPercentage: formData.discountPercentage,
        rating: 4.8,
        reviewCount: 1,
        image: primaryImg,
        images: allGalleryImages,
        descriptionBlocks: formData.descriptionBlocks,
        inStock,
        stockCount,
        description: formData.description || formData.shortDescription || 'Everyday home essential from SBS Store.',
        features: dynamicFeatures,
        isTrending: formData.isTrending,
        isBestSeller: formData.isBestSeller,
        isDealOfDay: formData.isDealOfDay,
      });
      showToast(`Product "${formData.name}" added to SBS catalog! 🎉`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[10px] font-black text-[#F95721] uppercase tracking-wider">
              Step {currentStep} of {totalSteps}
            </span>
            <h2 className="text-sm font-black text-gray-900">
              {productToEdit ? 'Edit Product' : 'Create New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 text-gray-600 hover:text-black flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1 px-4 py-2 bg-gray-50/80 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {stepsList.map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                currentStep === st.num
                  ? 'bg-[#F95721] text-white shadow-xs'
                  : currentStep > st.num
                  ? 'bg-orange-100/70 text-[#F95721]'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              <span>{st.num}.</span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>

        {/* Step Content Container */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Stainless Steel Vegetable Cutter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData({ ...formData, category: newCat, subcategory: '' });
                    }}
                    className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-semibold capitalize bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Sub-Category</label>
                  {(() => {
                    const currentCatObj = categories.find(c => c.id === formData.category);
                    const availableSubs = currentCatObj?.subcategories || [];

                    return (
                      <select
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-semibold capitalize bg-white"
                      >
                        <option value="">General / None</option>
                        {availableSubs.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Short Tagline Description</label>
                <input
                  type="text"
                  placeholder="Brief 1-liner summary for listings"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Full Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Write clear product highlights, usage instructions, and benefits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Gallery Images & Device Upload */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1.5">
                  Upload Gallery Photos from Device
                </label>

                {/* File Upload Dropzone */}
                <label className="border-2 border-dashed border-orange-300 hover:border-[#F95721] bg-orange-50/40 hover:bg-orange-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        Array.from(files).forEach((file) => {
                          if (!file.type.startsWith('image/')) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              handleAddGalleryImage(event.target!.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                  />
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#F95721] group-hover:scale-110 flex items-center justify-center transition-transform shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Tap to Choose Multiple Images from Device
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Add angle shots, lifestyle photos, packaging (Max 10MB each)
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#F95721] text-white text-[10px] font-bold rounded-xl shadow-xs">
                    Browse & Add Photos
                  </span>
                </label>
              </div>

              {/* Paste URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-2xl px-3.5 py-2 outline-none focus:border-[#F95721] text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddGalleryImage(newImageUrl)}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Add Image
                </button>
              </div>

              {/* Active Gallery Strip & Primary Selector */}
              <div className="border border-gray-200 rounded-2xl p-3.5 bg-gray-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">
                    Product Gallery Images ({formData.images.length})
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    ⭐ Cover image is marked with badge
                  </span>
                </div>

                {formData.images.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No gallery images added yet. Upload from device or enter image URLs above.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {formData.images.map((imgUrl, idx) => {
                      const isPrimary = formData.image === imgUrl || (idx === 0 && !formData.image);
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-2xl bg-white p-1.5 border-2 overflow-hidden flex flex-col justify-between group shadow-2xs ${
                            isPrimary ? 'border-[#F95721] ring-2 ring-orange-200' : 'border-gray-200'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />

                          {/* Primary Badge */}
                          {isPrimary && (
                            <span className="absolute top-1 left-1 text-[8px] font-black uppercase text-white bg-[#F95721] px-1.5 py-0.5 rounded-md shadow-xs">
                              Cover
                            </span>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity rounded-xl p-1">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgUrl)}
                                className="p-1 rounded-lg bg-white text-[#F95721] hover:bg-orange-50"
                                title="Set as cover image"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="p-1 rounded-lg bg-white text-red-500 hover:bg-red-50"
                              title="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Visual Story & Supporting Images Builder */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Rich Description & Visual Story</h4>
                  <p className="text-[10px] text-gray-600">
                    Add supporting image cards that appear when customers scroll down in product details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBlockForm(true)}
                  className="px-3 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-xs flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              {/* Modal / Form to Add a New Description Block */}
              {showAddBlockForm && (
                <div className="bg-white border-2 border-orange-300 rounded-2xl p-4 space-y-3 shadow-md animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-extrabold text-xs text-gray-900">Create Visual Story Block</span>
                    <button
                      type="button"
                      onClick={() => setShowAddBlockForm(false)}
                      className="text-gray-400 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-800 mb-1 text-[11px]">Section Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Ultrasonic Deep Cleansing"
                        value={newBlock.title}
                        onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#F95721] text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-800 mb-1 text-[11px]">Badge Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Feature Highlight / Step 1"
                        value={newBlock.badge}
                        onChange={(e) => setNewBlock({ ...newBlock, badge: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-[11px]">
                      Supporting Image (Upload or URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newBlock.image}
                        onChange={(e) => setNewBlock({ ...newBlock, image: e.target.value })}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                      />
                      <label className="px-3 py-2 bg-orange-100 text-[#F95721] hover:bg-orange-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 flex-shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setNewBlock(prev => ({ ...prev, image: event.target!.result as string }));
                                  showToast('Supporting image uploaded!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-[11px]">
                      Detailed Explanation Text *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain how this feature works, benefits, or step-by-step instructions..."
                      value={newBlock.text}
                      onChange={(e) => setNewBlock({ ...newBlock, text: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddBlockForm(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDescriptionBlock}
                      className="px-4 py-1.5 bg-[#00A859] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Save Section
                    </button>
                  </div>
                </div>
              )}

              {/* List of Existing Description Blocks */}
              <div className="space-y-3">
                {formData.descriptionBlocks.length === 0 ? (
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-2">
                    <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs font-bold text-gray-700">No visual story blocks created yet</p>
                    <p className="text-[11px] text-gray-500">
                      Add supporting image sections to elevate product description and boost customer conversions.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddBlockForm(true)}
                      className="px-4 py-1.5 bg-[#F95721] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Block</span>
                    </button>
                  </div>
                ) : (
                  formData.descriptionBlocks.map((block, idx) => (
                    <div
                      key={block.id || idx}
                      className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-2.5 relative group hover:border-[#F95721] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F95721] text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {block.badge && (
                            <span className="text-[9px] font-extrabold uppercase text-[#00A859] bg-[#EBF7F0] px-2 py-0.5 rounded-md">
                              {block.badge}
                            </span>
                          )}
                          <h5 className="font-extrabold text-gray-900 text-xs truncate">
                            {block.title || `Visual Block ${idx + 1}`}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDescriptionBlock(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        {block.image && (
                          <div className="w-20 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={block.image} alt="Block thumb" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-[11px] text-gray-600 line-clamp-3 leading-relaxed flex-1">
                          {block.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">MRP Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-bold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Crossed-out original price</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="599"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-bold text-[#F95721]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Actual customer price</p>
                </div>
              </div>

              {/* Calculated Discount Card */}
              <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-700">Calculated Discount:</span>
                  <p className="text-[10px] text-gray-500">Customer savings on SBS Store</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#F95721]">
                    {formData.discountPercentage}% OFF
                  </span>
                  <p className="text-[10px] font-semibold text-[#00A859]">
                    Saves ₹{Math.max(0, (parseFloat(formData.mrp) || 0) - (parseFloat(formData.price) || 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Inventory */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Product SKU Code</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Available Stock Count</label>
                  <input
                    type="number"
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-xs font-bold text-amber-600"
                  />
                </div>
              </div>

              {/* Stock Health Banner */}
              <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                parseInt(formData.stockCount) === 0
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : parseInt(formData.stockCount) <= parseInt(formData.lowStockThreshold)
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <span>Inventory Status:</span>
                <span>
                  {parseInt(formData.stockCount) === 0 
                    ? '⚠️ Out of Stock' 
                    : parseInt(formData.stockCount) <= parseInt(formData.lowStockThreshold)
                    ? '⚠️ Low Stock Warning' 
                    : '✅ Healthy Stock'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Specs & Adaptive Details */}
          {currentStep === 6 && (
            <div className="space-y-3.5">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-[11px] text-gray-600">
                💡 Attribute fields adapted for <span className="font-bold text-[#F95721] capitalize">{formData.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Capacity / Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 500ml / 20L / 1.5L"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Item Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 350g"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g. 20 x 15 x 10 cm"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Color / Variant</label>
                  <input
                    type="text"
                    placeholder="e.g. Pastel Green"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 outline-none focus:border-[#F95721] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Material / Build</label>
                <input
                  type="text"
                  placeholder="e.g. Food Grade Stainless Steel & BPA Free Plastic"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2 outline-none focus:border-[#F95721] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Warranty & Replacement</label>
                <input
                  type="text"
                  placeholder="e.g. 6 Months Replacement Warranty"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2 outline-none focus:border-[#F95721] text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Publishing & Storefront Flags */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-2">Publishing Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active', label: 'Active (Live)', color: 'bg-emerald-500 text-white' },
                    { id: 'draft', label: 'Draft / Hidden', color: 'bg-gray-600 text-white' },
                    { id: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500 text-white' }
                  ].map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setFormData({ ...formData, publishStatus: st.id as any })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        formData.publishStatus === st.id
                          ? `${st.color} border-transparent shadow-xs`
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Merchandising Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block font-bold text-gray-800">Homepage Merchandising Highlights</label>
                
                <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Trending Now</p>
                      <p className="text-[10px] text-gray-500">Feature on SBS Home Trending list</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F95721] accent-[#F95721]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⭐</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Best Seller Badge</p>
                      <p className="text-[10px] text-gray-500">Show Best Seller ribbon</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F95721] accent-[#F95721]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Today&apos;s Deal</p>
                      <p className="text-[10px] text-gray-500">Highlight in Deal of the Day widget</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isDealOfDay}
                    onChange={(e) => setFormData({ ...formData, isDealOfDay: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F95721] accent-[#F95721]"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl flex items-center gap-1 hover:bg-gray-100 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl text-xs hover:bg-gray-100"
            >
              Cancel
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-2xl flex items-center justify-center gap-1 text-xs shadow-sm shadow-orange-500/20"
            >
              <span>Next: {stepsList[currentStep]?.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-[#00A859] hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-sm shadow-green-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Save & Update Product' : 'Publish Product'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
