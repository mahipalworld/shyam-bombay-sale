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
  Eye,
  Video,
  Film,
  Cloud,
  Play,
  Lock,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Product, ProductDescriptionBlock, S3MediaItem } from '@/types';
import { ResolvedImage, ResolvedVideo } from '../common/ResolvedMedia';
import { uploadMediaToS3, listS3Files } from '@/lib/mediaStorage';

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
    video: '',
    videos: [] as string[],
    videoThumbnail: '',
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
    warranty: '',
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

  // Media Gallery Management States
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video'; url: string; title?: string } | null>(null);
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);
  const [deleteVideoConfirm, setDeleteVideoConfirm] = useState(false);

  // AWS S3 Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadPct, setImageUploadPct] = useState<number | null>(null);

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadPct, setVideoUploadPct] = useState<number | null>(null);

  // S3 Media Library Picker State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<S3MediaItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');

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
        video: productToEdit.video || '',
        videos: productToEdit.videos || [],
        videoThumbnail: productToEdit.videoThumbnail || '',
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
      // Default reset - blank product without dummy presets
      setFormData({
        name: '',
        category: categories[0]?.id || 'home',
        subcategory: '',
        shortDescription: '',
        description: '',
        image: '',
        images: [],
        video: '',
        videos: [],
        videoThumbnail: '',
        descriptionBlocks: [],
        mrp: '',
        price: '',
        discountPercentage: 0,
        sku: `SKU-${Date.now().toString().slice(-5)}`,
        stockCount: '10',
        lowStockThreshold: (storeSettings.lowStockThreshold || 5).toString(),
        stockStatus: 'In Stock',
        capacity: '',
        weight: '',
        dimensions: '',
        material: '',
        color: '',
        warranty: '',
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

  const handleUploadImagesToS3 = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadPct(0);

    let completed = 0;
    const uploadedKeys: string[] = [];

    for (const file of fileArray) {
      try {
        const item = await uploadMediaToS3(file, 'images', (pct: number) => {
          const overall = Math.round(((completed * 100) + pct) / fileArray.length);
          setImageUploadPct(overall);
        });
        uploadedKeys.push(item.key);
        completed++;
      } catch (err: any) {
        showToast(`Failed to upload ${file.name}: ${err?.message || 'Upload error'}`, 'error');
      }
    }

    if (uploadedKeys.length > 0) {
      setFormData(prev => {
        const updated = [...prev.images, ...uploadedKeys];
        return {
          ...prev,
          images: updated,
          image: prev.image || updated[0] || ''
        };
      });
      showToast(`Uploaded ${uploadedKeys.length} image(s) directly to AWS S3! ☁️`);
    }

    setIsUploadingImage(false);
    setImageUploadPct(null);
  };

  const handleUploadVideoToS3 = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4, WebM, MOV)', 'error');
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      showToast('Video exceeds 250MB limit', 'error');
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadPct(0);

    try {
      const item = await uploadMediaToS3(file, 'videos', (pct: number) => {
        setVideoUploadPct(pct);
      });

      setFormData(prev => ({
        ...prev,
        video: item.key,
        videos: prev.videos.includes(item.key) ? prev.videos : [...prev.videos, item.key]
      }));
      showToast('Video uploaded securely to AWS S3! 🎥');
    } catch (err: any) {
      showToast(`Video upload failed: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadPct(null);
    }
  };

  const openLibraryPicker = async (filter: 'ALL' | 'IMAGE' | 'VIDEO' = 'ALL') => {
    setLibraryFilter(filter);
    setIsLibraryOpen(true);
    setIsLoadingLibrary(true);
    try {
      const res = await listS3Files();
      setLibraryItems(res.items);
    } catch (err: any) {
      showToast(`Could not load S3 media: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

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

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.images.length) return;

    setFormData(prev => {
      const updated = [...prev.images];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return {
        ...prev,
        images: updated,
        image: prev.image === moved && targetIndex === 0 ? moved : (prev.image || updated[0] || '')
      };
    });
  };

  const handleSetPrimaryImage = (url: string) => {
    setFormData(prev => {
      const filtered = prev.images.filter(item => item !== url);
      return {
        ...prev,
        image: url,
        images: [url, ...filtered]
      };
    });
    showToast('Set as primary cover image (Position 1)! ⭐');
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
    setDeleteConfirmIdx(null);
    showToast('Photo removed from gallery');
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
        video: formData.video || undefined,
        videos: formData.videos.length > 0 ? formData.videos : undefined,
        videoThumbnail: formData.videoThumbnail || undefined,
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
        video: formData.video || undefined,
        videos: formData.videos.length > 0 ? formData.videos : undefined,
        videoThumbnail: formData.videoThumbnail || undefined,
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

          {/* STEP 2: Gallery Images & Product Video (AWS S3) */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Storage security notice */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">AWS S3 Private Storage</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> ap-south-1
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Direct presigned uploads • Short-lived private signed delivery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openLibraryPicker('ALL')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  <span>Browse S3 Media</span>
                </button>
              </div>

              {/* 1. PRODUCT IMAGES SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 text-xs">
                    Product Photos (Images)
                  </label>
                  <span className="text-[10px] text-gray-500">Max 15MB each (JPG, PNG, WebP)</span>
                </div>

                {/* Direct S3 Upload Dropzone */}
                <label className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group ${
                  isUploadingImage 
                    ? 'border-orange-400 bg-orange-50/70 pointer-events-none' 
                    : 'border-orange-300 hover:border-[#F95721] bg-orange-50/40 hover:bg-orange-50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingImage}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUploadImagesToS3(e.target.files);
                      }
                    }}
                  />
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#F95721] group-hover:scale-110 flex items-center justify-center transition-transform shadow-xs">
                    {isUploadingImage ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {isUploadingImage ? `Uploading Photos to S3 (${imageUploadPct ?? 0}%)...` : 'Tap to Upload Photos Directly to AWS S3'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Supports multiple photos at once. Stored in secure private bucket.
                    </p>
                  </div>
                  {isUploadingImage ? (
                    <div className="w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-[#F95721] h-1.5 transition-all duration-200" 
                        style={{ width: `${imageUploadPct || 0}%` }}
                      />
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-[#F95721] text-white text-[10px] font-bold rounded-xl shadow-xs">
                      Choose Images from Device
                    </span>
                  )}
                </label>

                {/* Paste URL or S3 key Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste S3 key / external image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-2xl px-3.5 py-2 outline-none focus:border-[#F95721] text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddGalleryImage(newImageUrl)}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>

                {/* Active Gallery Strip & Primary Selector */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800">
                        Product Gallery ({formData.images.length} Photos)
                      </span>
                      <p className="text-[10px] text-gray-500">
                        Tap photo to preview • Reorder with arrows • Star to set cover
                      </p>
                    </div>
                    {formData.images.length > 0 && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        Cover = Position 1
                      </span>
                    )}
                  </div>

                  {formData.images.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl bg-white/60">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-gray-700">No gallery photos added yet</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Upload photos directly to AWS S3 above or select from S3 Media library.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.images.map((imgUrl, idx) => {
                        const isPrimary = formData.image === imgUrl || (idx === 0 && !formData.image);
                        const isConfirming = deleteConfirmIdx === idx;

                        return (
                          <div
                            key={idx}
                            className={`relative rounded-2xl bg-white border-2 overflow-hidden flex flex-col shadow-xs transition-all ${
                              isPrimary ? 'border-[#F95721] ring-2 ring-orange-200/60' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Card Header: Position badge & Cover indicator */}
                            <div className="px-2 py-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-700 flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-[9px] font-black">
                                  {idx + 1}
                                </span>
                                {isPrimary ? 'Cover' : 'Photo'}
                              </span>
                              {isPrimary ? (
                                <span className="text-[9px] font-black uppercase text-white bg-[#F95721] px-1.5 py-0.2 rounded shadow-xs">
                                  ★ Primary
                                </span>
                              ) : (
                                <span className="text-[9px] text-gray-400 font-medium">#{idx + 1}</span>
                              )}
                            </div>

                            {/* Image Container: Tapping ONLY opens full-screen preview, NEVER deletes */}
                            <div
                              onClick={() => setPreviewMedia({ type: 'image', url: imgUrl, title: `Product Photo #${idx + 1}` })}
                              className="relative aspect-square w-full p-2 cursor-pointer group bg-[#F9FAFB] flex items-center justify-center overflow-hidden"
                              title="Tap to preview photo"
                            >
                              <ResolvedImage
                                src={imgUrl}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="px-2 py-1 bg-white/95 rounded-xl text-[10px] font-bold text-gray-900 shadow-md flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-[#F95721]" />
                                  Preview
                                </span>
                              </div>
                            </div>

                            {/* Control Bar: Reordering, Cover, and Safe Delete */}
                            <div className="p-1.5 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between gap-1">
                              {isConfirming ? (
                                <div className="w-full flex items-center justify-between gap-1 animate-fadeIn">
                                  <span className="text-[9px] font-black text-red-600">Delete?</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGalleryImage(idx)}
                                      className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-[9px] font-black hover:bg-red-700"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmIdx(null)}
                                      className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-lg text-[9px] font-bold hover:bg-gray-300"
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1">
                                    {/* Move Left */}
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveImage(idx, 'left')}
                                      className="p-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                      title="Move Left"
                                    >
                                      <ArrowLeft className="w-3 h-3" />
                                    </button>

                                    {/* Move Right */}
                                    <button
                                      type="button"
                                      disabled={idx === formData.images.length - 1}
                                      onClick={() => handleMoveImage(idx, 'right')}
                                      className="p-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                      title="Move Right"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>

                                    {/* Set as Cover */}
                                    {!isPrimary && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryImage(imgUrl)}
                                        className="p-1 rounded-lg bg-white border border-orange-200 text-[#F95721] hover:bg-orange-50 transition-colors"
                                        title="Make primary cover"
                                      >
                                        <Star className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Delete Button (triggers confirmation state) */}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmIdx(idx)}
                                    className="p-1 rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete photo"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PRODUCT VIDEO SECTION (AWS S3) */}
              <div className="border border-purple-100 bg-purple-50/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Product Demo Video (AWS S3)</h4>
                      <p className="text-[10px] text-gray-500">
                        Tap preview to watch. Streams via byte-range in customer gallery.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">
                    Max 250MB
                  </span>
                </div>

                {formData.video ? (
                  <div className="bg-white border border-purple-200 rounded-2xl p-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    {/* Tapping video thumbnail triggers full preview */}
                    <div 
                      onClick={() => setPreviewMedia({ type: 'video', url: formData.video, title: 'Product Video Demo' })}
                      className="flex items-center gap-3 w-full sm:w-auto cursor-pointer group"
                      title="Tap to preview video"
                    >
                      <div className="w-24 h-16 rounded-xl bg-slate-900 overflow-hidden relative flex-shrink-0 flex items-center justify-center shadow-xs">
                        <ResolvedVideo
                          src={formData.video}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <Play className="w-5 h-5 text-white fill-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                          {formData.video.split('/').pop()}
                        </p>
                        <p className="text-[10px] text-purple-600 font-mono truncate">
                          {formData.video}
                        </p>
                        <span className="inline-block mt-1 text-[9px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                          ✓ S3 Video Attached • Tap to Play
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {deleteVideoConfirm ? (
                        <div className="flex items-center gap-1 animate-fadeIn">
                          <span className="text-[10px] font-bold text-red-600">Remove?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, video: '', videos: [] }));
                              setDeleteVideoConfirm(false);
                              showToast('Video removed');
                            }}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteVideoConfirm(false)}
                            className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openLibraryPicker('VIDEO')}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteVideoConfirm(true)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            title="Remove video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group ${
                    isUploadingVideo
                      ? 'border-purple-400 bg-purple-50/80 pointer-events-none'
                      : 'border-purple-300 hover:border-purple-500 bg-white/70 hover:bg-white'
                  }`}>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      disabled={isUploadingVideo}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadVideoToS3(file);
                      }}
                    />
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 flex items-center justify-center transition-transform">
                      {isUploadingVideo ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {isUploadingVideo ? `Uploading Video to S3 (${videoUploadPct ?? 0}%)...` : 'Upload Product Video to AWS S3'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        MP4, WebM or MOV up to 250MB
                      </p>
                    </div>
                    {isUploadingVideo ? (
                      <div className="w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-600 h-1.5 transition-all duration-200"
                          style={{ width: `${videoUploadPct || 0}%` }}
                        />
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-xl shadow-xs">
                        Select Video File
                      </span>
                    )}
                  </label>
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

      {/* S3 Media Library Picker Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-bold">Select Media from AWS S3 Bucket</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLibraryFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  libraryFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                All Files
              </button>
              <button
                type="button"
                onClick={() => setLibraryFilter('IMAGE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  libraryFilter === 'IMAGE' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Photos Only
              </button>
              <button
                type="button"
                onClick={() => setLibraryFilter('VIDEO')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  libraryFilter === 'VIDEO' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Videos Only
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-[260px]">
              {isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                  <p className="text-xs">Connecting to S3 bucket...</p>
                </div>
              ) : libraryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                  <Package className="w-8 h-8 stroke-1 text-gray-300" />
                  <p className="text-xs">No media files found in your S3 bucket yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {libraryItems
                    .filter(item => {
                      if (libraryFilter === 'IMAGE') return item.type === 'image';
                      if (libraryFilter === 'VIDEO') return item.type === 'video';
                      return true;
                    })
                    .map(item => (
                      <div
                        key={item.key}
                        onClick={() => {
                          if (item.type === 'image') {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.includes(item.key) ? prev.images : [...prev.images, item.key],
                              image: prev.image || item.key
                            }));
                            showToast('Photo added from S3! 📸');
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              video: item.key,
                              videos: prev.videos.includes(item.key) ? prev.videos : [...prev.videos, item.key]
                            }));
                            showToast('Video selected from S3! 🎥');
                          }
                          setIsLibraryOpen(false);
                        }}
                        className="group border border-gray-200 hover:border-orange-500 rounded-2xl p-2 cursor-pointer transition-all hover:shadow-md bg-white flex flex-col justify-between"
                      >
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                          {item.type === 'image' ? (
                            <ResolvedImage
                              src={item.key}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                              <ResolvedVideo
                                src={item.key}
                                className="w-full h-full object-cover opacity-70"
                                controls={false}
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-700 truncate mt-1.5" title={item.name}>
                          {item.name}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Media Preview Modal */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {previewMedia.type === 'video' ? (
                  <Film className="w-4 h-4 text-purple-400" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-orange-400" />
                )}
                <span className="text-xs font-bold truncate">
                  {previewMedia.title || (previewMedia.type === 'video' ? 'Video Preview' : 'Photo Preview')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center p-2 min-h-[320px] max-h-[70vh] overflow-hidden">
              {previewMedia.type === 'video' ? (
                <ResolvedVideo
                  src={previewMedia.url}
                  className="max-h-[65vh] w-auto max-w-full rounded-2xl"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <ResolvedImage
                  src={previewMedia.url}
                  alt="Preview"
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl"
                />
              )}
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[10px] truncate max-w-xs">{previewMedia.url}</span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
