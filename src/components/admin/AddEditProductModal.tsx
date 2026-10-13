'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, sanitizeProductFeatures, sanitizeProductDescription } from '@/context/StoreContext';
import { 
  X, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Package, 
  DollarSign, 
  FileText, 
  Plus, 
  Trash2, 
  Layers, 
  Star, 
  Eye, 
  Video, 
  Cloud, 
  ArrowRight, 
  ArrowLeft,
  Tag, 
  Barcode, 
  Camera,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Flame,
  Award,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Product, ProductDescriptionBlock, S3MediaItem } from '@/types';
import { ResolvedImage } from '../common/ResolvedMedia';
import { uploadMediaToS3, listS3Files } from '@/lib/mediaStorage';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';

const SPEC_PRESETS = [
  { label: 'Brand', value: 'SBS Certified Quality' },
  { label: 'Condition', value: '100% Brand New (Sealed)' },
  { label: 'Material & Build', value: 'Food Grade Stainless Steel & BPA-Free' },
  { label: 'Battery Backup', value: 'Up to 120 Mins Continuous Use' },
  { label: 'Charging Type', value: 'USB Type-C Fast Charging' },
  { label: 'Warranty & Support', value: '6 Months Replacement Warranty' },
  { label: 'Package Includes', value: '1x Main Unit, User Manual, Accessories' },
  { label: 'Country of Origin', value: 'India' },
];

const HIGHLIGHT_PRESETS = [
  'Premium Build Quality',
  '100% Sealed & Genuine',
  'USB Rechargeable',
  'Lightweight & Portable',
  'Quick & Easy to Clean',
  '6 Months Replacement',
];

const DEFAULT_PRODUCT_SPECIFICATIONS = (category = 'General', subcategory = 'General') => [
  { label: 'Brand', value: 'SBS Certified' },
  { label: 'Category', value: category },
  { label: 'Subcategory', value: subcategory || 'General' },
  { label: 'Condition', value: 'Brand New (100% Sealed)' },
  { label: 'Warranty', value: '6 Months Manufacturer Support' },
  { label: 'In The Box', value: '1x Main Unit, User Guide & Accessories' },
  { label: 'Dispatch Origin', value: 'Mumbai Central Hub, India' },
];

const STEPS = [
  { id: 'basics', num: 1, label: '1. Basics', shortLabel: 'Basics', icon: FileText, desc: 'Name & Barcode' },
  { id: 'media', num: 2, label: '2. Media', shortLabel: 'Photos', icon: ImageIcon, desc: 'Photos & Videos' },
  { id: 'pricing', num: 3, label: '3. Pricing', shortLabel: 'Pricing', icon: DollarSign, desc: 'Price & Stock' },
  { id: 'specs', num: 4, label: '4. Specs', shortLabel: 'Specs', icon: Sparkles, desc: 'Highlights & Specs' },
  { id: 'story', num: 5, label: '5. Badges', shortLabel: 'Badges', icon: Layers, desc: 'Badges & Preview' },
] as const;

type SectionId = (typeof STEPS)[number]['id'];

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

  const [activeSection, setActiveSection] = useState<SectionId>('basics');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    customId: '',
    barcode: '',
    stockCount: '25',
    lowStockThreshold: '5',
    stockStatus: 'In Stock',
    subtitle: '',
    features: [] as string[],
    featureIcons: [] as { icon: string; label: string }[],
    specifications: DEFAULT_PRODUCT_SPECIFICATIONS(),
    faqs: [] as { question: string; answer: string }[],
    shippingInfo: '',
    returnPolicy: '',
    publishStatus: 'active' as 'active' | 'draft' | 'out_of_stock',
    isTrending: false,
    isBestSeller: false,
    isDealOfDay: false,
    isFeatured: false,
    isSuperDeal: false,
    isTopRated: false,
  });

  // Modal Sub-States
  const [newHighlight, setNewHighlight] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<S3MediaItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // S3 Upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadPct, setImageUploadPct] = useState<number | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadPct, setVideoUploadPct] = useState<number | null>(null);

  // Visual Story Block New State
  const [newBlock, setNewBlock] = useState<ProductDescriptionBlock>({
    title: '',
    badge: 'Feature Highlight',
    text: '',
    image: '',
  });
  const [showAddBlockForm, setShowAddBlockForm] = useState(false);

  // Auto calculate discount percentage
  useEffect(() => {
    const mrpNum = parseFloat(formData.mrp);
    const priceNum = parseFloat(formData.price);
    if (mrpNum > 0 && priceNum > 0 && mrpNum >= priceNum) {
      const disc = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
      setFormData(prev => ({ ...prev, discountPercentage: disc }));
    } else {
      setFormData(prev => ({ ...prev, discountPercentage: 0 }));
    }
  }, [formData.mrp, formData.price]);

  // Populate data on edit or new
  useEffect(() => {
    if (productToEdit) {
      const allImgs = productToEdit.images && productToEdit.images.length > 0
        ? productToEdit.images
        : [productToEdit.image];

      setFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        subcategory: productToEdit.subcategory || '',
        shortDescription: sanitizeProductDescription(productToEdit.description).slice(0, 80),
        description: sanitizeProductDescription(productToEdit.description),
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
        customId: productToEdit.id,
        barcode: productToEdit.barcode || (productToEdit.id.startsWith('p_') ? '' : productToEdit.id),
        stockCount: productToEdit.stockCount.toString(),
        lowStockThreshold: storeSettings.lowStockThreshold.toString(),
        stockStatus: productToEdit.inStock ? 'In Stock' : 'Out of Stock',
        subtitle: productToEdit.subtitle || '',
        features: sanitizeProductFeatures(productToEdit.features),
        featureIcons: productToEdit.featureIcons || [],
        specifications: (productToEdit.specifications && productToEdit.specifications.length > 0)
          ? productToEdit.specifications
          : DEFAULT_PRODUCT_SPECIFICATIONS(productToEdit.category, productToEdit.subcategory),
        faqs: productToEdit.faqs || [],
        shippingInfo: productToEdit.shippingInfo || '',
        returnPolicy: productToEdit.returnPolicy || '',
        publishStatus: productToEdit.inStock ? 'active' : 'out_of_stock',
        isTrending: !!productToEdit.isTrending,
        isBestSeller: !!productToEdit.isBestSeller,
        isDealOfDay: !!productToEdit.isDealOfDay,
        isFeatured: !!productToEdit.isFeatured,
        isSuperDeal: !!productToEdit.isSuperDeal,
        isTopRated: !!productToEdit.isTopRated,
      });
    } else {
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
        customId: '',
        barcode: '',
        stockCount: '25',
        lowStockThreshold: (storeSettings.lowStockThreshold || 5).toString(),
        stockStatus: 'In Stock',
        subtitle: '',
        features: [],
        featureIcons: [],
        specifications: DEFAULT_PRODUCT_SPECIFICATIONS(categories[0]?.id),
        faqs: [],
        shippingInfo: '',
        returnPolicy: '',
        publishStatus: 'active',
        isTrending: false,
        isBestSeller: false,
        isDealOfDay: false,
        isFeatured: false,
        isSuperDeal: false,
        isTopRated: false,
      });
    }
    setActiveSection('basics');
  }, [productToEdit, categories, storeSettings]);

  if (!isOpen) return null;

  const currentStepIndex = STEPS.findIndex(s => s.id === activeSection);
  const currentStep = STEPS[currentStepIndex] || STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const prevStep = currentStepIndex > 0 ? STEPS[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < STEPS.length - 1 ? STEPS[currentStepIndex + 1] : null;

  const navigateToSection = (secId: SectionId) => {
    setActiveSection(secId);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const element = document.getElementById(`sec-${secId}`);
    if (element && window.innerWidth >= 640) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextStep = () => {
    if (activeSection === 'basics') {
      if (!formData.name.trim()) {
        showToast('Please enter a product name', 'error');
        return;
      }
    }
    if (activeSection === 'pricing') {
      if (!formData.price || !formData.mrp) {
        showToast('Please set selling price and MRP', 'error');
        return;
      }
    }
    if (nextStep) {
      navigateToSection(nextStep.id);
    }
  };

  const handlePrevStep = () => {
    if (prevStep) {
      navigateToSection(prevStep.id);
    }
  };

  const handleUploadImagesToS3 = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadPct(0);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const item = await uploadMediaToS3(fileArray[i], 'images', (pct: number) => {
          setImageUploadPct(Math.round(((i + pct / 100) / fileArray.length) * 100));
        });
        uploadedUrls.push(item.key);
      }

      setFormData(prev => {
        const newImages = [...prev.images, ...uploadedUrls];
        return {
          ...prev,
          images: newImages,
          image: prev.image || newImages[0] || ''
        };
      });

      showToast(`Uploaded ${uploadedUrls.length} image(s) to AWS S3! 📸`);
    } catch (err: any) {
      showToast(`Upload failed: ${err?.message || 'S3 upload error'}`, 'error');
    } finally {
      setIsUploadingImage(false);
      setImageUploadPct(null);
    }
  };

  const handleUploadVideoToS3 = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4 / WebM)', 'error');
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
        videos: [item.key]
      }));
      showToast('Video uploaded to AWS S3! 🎥');
    } catch (err: any) {
      showToast(`Failed to upload video: ${err?.message || 'Upload error'}`, 'error');
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadPct(null);
    }
  };

  const handleOpenS3Library = async () => {
    setIsLibraryOpen(true);
    setIsLoadingLibrary(true);
    try {
      const files = await listS3Files();
      setLibraryItems(Array.isArray(files) ? files : files?.items || []);
    } catch {
      showToast('Unable to load S3 media library', 'error');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormData(prev => {
      const list = [...prev.images];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      const [moved] = list.splice(index, 1);
      list.splice(targetIndex, 0, moved);

      return {
        ...prev,
        images: list,
        image: list[0] || prev.image,
      };
    });
  };

  const handleDeleteImage = (index: number) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image: prev.image === prev.images[index] ? (updated[0] || '') : prev.image
      };
    });
    showToast('Photo removed');
  };

  const handleSetCover = (index: number) => {
    setFormData(prev => {
      const img = prev.images[index];
      if (!img) return prev;
      const rest = prev.images.filter((_, i) => i !== index);
      const reordered = [img, ...rest];
      return {
        ...prev,
        images: reordered,
        image: img,
      };
    });
    showToast('Set as main cover photo ⭐');
  };

  const handleAddHighlight = (textToAdd?: string) => {
    const text = (textToAdd || newHighlight).trim();
    if (!text) return;
    if (formData.features.includes(text)) {
      showToast('Feature highlight already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, text]
    }));
    if (!textToAdd) setNewHighlight('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  const handleAddDescriptionBlock = () => {
    if (!newBlock.title?.trim() && !newBlock.text?.trim()) {
      showToast('Please enter title or text for story block', 'error');
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

  const handleSaveProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a product name', 'error');
      navigateToSection('basics');
      return;
    }
    if (!formData.price || !formData.mrp) {
      showToast('Please set selling price and MRP', 'error');
      navigateToSection('pricing');
      return;
    }

    const price = parseFloat(formData.price) || 0;
    const originalPrice = parseFloat(formData.mrp) || price;
    const stockCount = parseInt(formData.stockCount) || 0;
    const inStock = formData.publishStatus !== 'out_of_stock' && stockCount > 0;
    const primaryImg = formData.image || formData.images[0] || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80';
    const allGalleryImages = formData.images.length > 0 ? formData.images : [primaryImg];

    const combinedFeatures: string[] = sanitizeProductFeatures(formData.features);
    const cleanDescription = sanitizeProductDescription(formData.description || formData.shortDescription || '');

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        barcode: formData.barcode.trim() || undefined,
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
        description: cleanDescription,
        features: combinedFeatures,
        subtitle: formData.subtitle || undefined,
        featureIcons: formData.featureIcons.length > 0 ? formData.featureIcons : undefined,
        specifications: formData.specifications,
        faqs: formData.faqs.length > 0 ? formData.faqs : undefined,
        shippingInfo: formData.shippingInfo || undefined,
        returnPolicy: formData.returnPolicy || undefined,
        isTrending: formData.isTrending,
        isBestSeller: formData.isBestSeller,
        isDealOfDay: formData.isDealOfDay,
        isFeatured: formData.isFeatured,
        isSuperDeal: formData.isSuperDeal,
        isTopRated: formData.isTopRated,
      });
      showToast(`Product "${formData.name}" updated successfully!`);
    } else {
      addProduct({
        id: formData.customId.trim() || (formData.barcode.trim() ? formData.barcode.trim() : undefined),
        barcode: formData.barcode.trim() || undefined,
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
        description: cleanDescription,
        features: combinedFeatures,
        subtitle: formData.subtitle || undefined,
        featureIcons: formData.featureIcons.length > 0 ? formData.featureIcons : undefined,
        specifications: formData.specifications,
        faqs: formData.faqs.length > 0 ? formData.faqs : undefined,
        shippingInfo: formData.shippingInfo || undefined,
        returnPolicy: formData.returnPolicy || undefined,
        isTrending: formData.isTrending,
        isBestSeller: formData.isBestSeller,
        isDealOfDay: formData.isDealOfDay,
        isFeatured: formData.isFeatured,
        isSuperDeal: formData.isSuperDeal,
        isTopRated: formData.isTopRated,
      });
      showToast(`Product "${formData.name}" added to SBS catalog! 🎉`);
    }
    onClose();
  };

  const currentCategoryObj = categories.find(c => c.id === formData.category);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 lg:p-6 overflow-hidden animate-fadeIn">
      {/* Modal Container: Full-height on mobile (never overflowing top/bottom) / Rounded card on desktop */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] max-w-5xl rounded-none sm:rounded-3xl flex flex-col shadow-2xl border-0 sm:border border-slate-200 overflow-hidden animate-slideUp">
        
        {/* Mobile Pull / Drag Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2 mb-0.5 sm:hidden shrink-0" />

        {/* ========================================================= */}
        {/* MODAL HEADER: Title, Step Indicator & Close */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Step navigation shortcut on mobile if beyond step 1 */}
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center sm:hidden shrink-0 active:scale-95 transition-all shadow-3xs"
                aria-label="Previous Step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#F95721] to-[#FF7E47] text-white flex items-center justify-center font-black shadow-xs shadow-orange-500/20 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                  {productToEdit ? 'Edit Product' : 'Create New Product'}
                </h2>
                <span className="sm:hidden text-[10px] font-black bg-orange-100 text-[#F95721] px-1.5 py-0.5 rounded-full shrink-0">
                  {currentStepIndex + 1}/5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden xs:block">
                {formData.name.trim() ? formData.name : 'SBS Store Catalog Item'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Save button on header if product is valid and on edit mode */}
            {productToEdit && (
              <button
                type="button"
                onClick={() => handleSaveProduct()}
                className="hidden xs:flex sm:hidden px-2.5 py-1 bg-orange-50 text-[#F95721] border border-orange-200 rounded-xl text-[11px] font-black items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Linear Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1 sm:hidden shrink-0">
          <div 
            className="bg-gradient-to-r from-[#F95721] to-[#FF7E47] h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* ========================================================= */}
        {/* STEP NAVIGATION PILLS: Touch-Optimized Segmented Bar */}
        {/* ========================================================= */}
        <div className="px-3 sm:px-5 py-2 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs font-bold shrink-0">
          {STEPS.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;

            // Compute step completion status
            let isComplete = false;
            if (sec.id === 'basics' && formData.name.trim()) isComplete = true;
            if (sec.id === 'media' && formData.images.length > 0) isComplete = true;
            if (sec.id === 'pricing' && formData.price && formData.mrp) isComplete = true;
            if (sec.id === 'specs' && (formData.features.length > 0 || formData.specifications.length > 0)) isComplete = true;
            if (sec.id === 'story') isComplete = false;

            return (
              <button
                key={sec.id}
                onClick={() => navigateToSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 text-xs shrink-0 ${
                  isActive
                    ? 'bg-orange-50 text-[#F95721] border border-orange-200/90 shadow-3xs font-black'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isComplete && !isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{sec.num}. {sec.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* FORM CONTENT CONTAINER: Focused View on Mobile / Continuous Canvas on Desktop */}
        {/* ========================================================= */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 no-scrollbar bg-white"
        >
          {/* ======================================================= */}
          {/* STEP 1: BASICS & CATEGORY & BARCODE */}
          {/* ======================================================= */}
          <div 
            id="sec-basics" 
            className={`${activeSection === 'basics' ? 'block' : 'hidden sm:block'} space-y-4`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-xs">
                  1
                </span>
                <h3 className="text-sm font-black text-slate-900">Basic Information & Barcode</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                Step 1 of 5
              </span>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name <span className="text-[#F95721]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Portable Mini Electric Food Chopper 250ml"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-3 text-sm text-slate-900 font-semibold outline-hidden focus:border-[#F95721] focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Category <span className="text-[#F95721]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-3 pr-10 text-sm font-semibold text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white appearance-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subcategory (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-3 pr-10 text-sm font-semibold text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white appearance-none"
                    >
                      <option value="">General (No subcategory)</option>
                      {currentCategoryObj?.subcategories?.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Barcode with Direct Camera Scan Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Barcode (EAN-13 / UPC)
                </label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="e.g., 8901030829102"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-3 py-3 text-sm font-mono text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="h-[46px] px-3.5 sm:px-4 bg-orange-50 hover:bg-orange-100 text-[#F95721] border border-orange-200/90 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-3xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="font-black">Scan Camera</span>
                  </button>
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., Wireless USB Rechargeable • Stainless Steel Blades"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-3 text-sm text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features, usage instructions, build quality..."
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-sm text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* In-canvas Next Button for Mobile */}
            {activeSection === 'basics' && (
              <div className="sm:hidden pt-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 bg-[#F95721] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <span>Continue to Step 2: Photos & Media</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* STEP 2: MEDIA & S3 GALLERY */}
          {/* ======================================================= */}
          <div 
            id="sec-media" 
            className={`${activeSection === 'media' ? 'block' : 'hidden sm:block'} space-y-4 pt-1 sm:pt-4 sm:border-t border-slate-100`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-xs">
                  2
                </span>
                <h3 className="text-sm font-black text-slate-900">Photos & Media Assets</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">
                  {formData.images.length} photo{formData.images.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  onClick={handleOpenS3Library}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200/60"
                >
                  <Cloud className="w-3.5 h-3.5 text-[#F95721]" />
                  <span>S3 Library</span>
                </button>
              </div>
            </div>

            {/* Image Upload Dropzone */}
            <div className="space-y-3">
              <label className="border-2 border-dashed border-orange-200 hover:border-[#F95721] bg-orange-50/20 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#F95721] flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">
                    <span className="text-[#F95721]">Tap to upload photos</span> from Camera or Gallery
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Direct to AWS S3 bucket • Supports JPG, PNG, WEBP</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleUploadImagesToS3(e.target.files)}
                  className="hidden"
                />
              </label>

              {isUploadingImage && (
                <div className="p-3 bg-orange-50 border border-orange-200/80 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-orange-800">
                    <span>Uploading images to S3...</span>
                    <span>{imageUploadPct || 20}%</span>
                  </div>
                  <div className="w-full bg-orange-200/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#F95721] h-full transition-all duration-200" 
                      style={{ width: `${imageUploadPct || 20}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Product Gallery ({formData.images.length} photos)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Photo 1 is the main store cover
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((img, idx) => {
                      const isCover = idx === 0 || formData.image === img;
                      return (
                        <div 
                          key={`${img}-${idx}`} 
                          className={`relative rounded-2xl overflow-hidden aspect-square border-2 bg-white flex flex-col justify-between transition-all group shadow-2xs ${
                            isCover ? 'border-[#F95721] ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Top-Left: Cover Badge or Set As Cover Button */}
                          <div className="absolute top-2 left-2 z-20">
                            {isCover ? (
                              <span className="px-2.5 py-1 bg-[#F95721] text-white text-[10px] font-black rounded-lg shadow-sm flex items-center gap-1 select-none">
                                ⭐ Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSetCover(idx);
                                }}
                                className="px-2.5 py-1 bg-white/95 hover:bg-[#F95721] hover:text-white text-slate-800 text-[10px] font-extrabold rounded-lg shadow-sm border border-slate-200 transition-colors cursor-pointer active:scale-95 touch-manipulation"
                                title="Make this the main cover image"
                              >
                                Set Cover
                              </button>
                            )}
                          </div>

                          {/* Top-Right: Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteImage(idx);
                            }}
                            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-slate-900/85 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer active:scale-90 touch-manipulation"
                            title="Delete photo"
                            aria-label="Delete photo"
                          >
                            <X className="w-4 h-4 pointer-events-none" />
                          </button>

                          {/* Image display with safe padding to avoid overlapping top and bottom controls */}
                          <div className="w-full h-full flex items-center justify-center px-3 pt-9 pb-11 relative z-0 pointer-events-none select-none">
                            <ResolvedImage src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain pointer-events-none" />
                          </div>

                          {/* Bottom Reorder Controls */}
                          <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between bg-white/95 backdrop-blur-xs rounded-xl px-2 py-1 border border-slate-200/90 shadow-sm">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMoveImage(idx, 'left');
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer active:scale-90 touch-manipulation"
                              title="Move photo left"
                              aria-label="Move photo left"
                            >
                              <ChevronLeft className="w-4 h-4 pointer-events-none" />
                            </button>

                            <span className="text-[11px] font-black text-slate-700 select-none">
                              {idx + 1} of {formData.images.length}
                            </span>

                            <button
                              type="button"
                              disabled={idx === formData.images.length - 1}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMoveImage(idx, 'right');
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer active:scale-90 touch-manipulation"
                              title="Move photo right"
                              aria-label="Move photo right"
                            >
                              <ChevronRight className="w-4 h-4 pointer-events-none" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video Demo Uploader (Optional) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Product Reel / Video Demo (Optional)
                </label>
                
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {formData.video ? '1 Video Attached' : 'No Video Demo Added'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {formData.video ? formData.video : 'MP4 or WebM up to 100MB'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {formData.video ? (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, video: '', videos: [] })}
                        className="px-2.5 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <label className="cursor-pointer px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors border border-blue-200">
                        Upload Video
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={(e) => e.target.files && e.target.files[0] && handleUploadVideoToS3(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* In-canvas Next Button for Mobile */}
            {activeSection === 'media' && (
              <div className="sm:hidden pt-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 bg-[#F95721] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <span>Continue to Step 3: Pricing & Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* STEP 3: PRICING & WAREHOUSE STOCK */}
          {/* ======================================================= */}
          <div 
            id="sec-pricing" 
            className={`${activeSection === 'pricing' ? 'block' : 'hidden sm:block'} space-y-4 pt-1 sm:pt-4 sm:border-t border-slate-100`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-xs">
                  3
                </span>
                <h3 className="text-sm font-black text-slate-900">Pricing & Warehouse Stock</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                Step 3 of 5
              </span>
            </div>

            {/* Pricing Card */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP Price (₹) <span className="text-[#F95721]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="999"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-8 pr-3 py-3 text-sm font-black text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (₹) <span className="text-[#F95721]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F95721] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="499"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-8 pr-3 py-3 text-sm font-black text-[#F95721] outline-hidden focus:border-[#F95721] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Discount & Savings Card */}
              {formData.discountPercentage > 0 && formData.mrp && formData.price && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                      %
                    </div>
                    <div>
                      <p className="font-black text-emerald-900 text-sm">
                        {formData.discountPercentage}% OFF
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Customer saves ₹{(parseFloat(formData.mrp) - parseFloat(formData.price)).toFixed(0)} on every order
                      </p>
                    </div>
                  </div>
                  <Tag className="w-5 h-5 text-emerald-500" />
                </div>
              )}

              {/* Warehouse Inventory Stock */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Warehouse Units Available
                  </label>
                  <span className="text-[10px] text-slate-400">Quick preset buttons:</span>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    type="number"
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                    placeholder="25"
                    className="w-24 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-hidden focus:border-[#F95721]"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['10', '25', '50', '100'].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setFormData({ ...formData, stockCount: cnt })}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-3xs"
                      >
                        +{cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status Pill */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, publishStatus: 'active' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      formData.publishStatus === 'active'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    🟢 In Stock (Sellable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, publishStatus: 'out_of_stock' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      formData.publishStatus === 'out_of_stock'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    🔴 Out of Stock
                  </button>
                </div>
              </div>
            </div>

            {/* In-canvas Next Button for Mobile */}
            {activeSection === 'pricing' && (
              <div className="sm:hidden pt-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 bg-[#F95721] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <span>Continue to Step 4: Specs & Highlights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* STEP 4: BULLET HIGHLIGHTS & SPECIFICATIONS */}
          {/* ======================================================= */}
          <div 
            id="sec-specs" 
            className={`${activeSection === 'specs' ? 'block' : 'hidden sm:block'} space-y-4 pt-1 sm:pt-4 sm:border-t border-slate-100`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-xs">
                  4
                </span>
                <h3 className="text-sm font-black text-slate-900">Highlights & Technical Specs</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                Step 4 of 5
              </span>
            </div>

            {/* Bullet Highlights Section */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Bullet Feature Highlights
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                  placeholder="e.g., Japanese Stainless Steel Blades..."
                  className="flex-1 bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs outline-hidden focus:border-[#F95721] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddHighlight()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-xs flex items-center gap-1 shadow-3xs active:scale-95 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Highlight Presets */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold">1-Tap Quick Presets:</p>
                <div className="flex flex-wrap gap-1.5">
                  {HIGHLIGHT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddHighlight(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:text-[#F95721] text-slate-600 rounded-xl text-[10px] font-bold transition-all border border-slate-200/50"
                    >
                      +{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Highlights Chips */}
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.features.map((feat, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-orange-50 text-[#F95721] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-orange-200/80 animate-fadeIn"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-orange-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Table */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="block text-xs font-bold text-slate-700">
                  Specifications ({formData.specifications.length} entries)
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  {SPEC_PRESETS.slice(0, 3).map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!formData.specifications.some(s => s.label === p.label)) {
                          setFormData({
                            ...formData,
                            specifications: [...formData.specifications, { label: p.label, value: p.value }]
                          });
                        }
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg text-slate-700 font-bold"
                    >
                      +{p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar border border-slate-200/80 rounded-2xl p-2 bg-slate-50/50">
                {formData.specifications.map((spec, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-100">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => {
                        const updated = [...formData.specifications];
                        updated[idx].label = e.target.value;
                        setFormData({ ...formData, specifications: updated });
                      }}
                      className="w-1/3 bg-transparent text-xs font-bold text-slate-700 outline-hidden"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const updated = [...formData.specifications];
                        updated[idx].value = e.target.value;
                        setFormData({ ...formData, specifications: updated });
                      }}
                      className="flex-1 bg-transparent text-xs text-slate-900 outline-hidden"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          specifications: formData.specifications.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In-canvas Next Button for Mobile */}
            {activeSection === 'specs' && (
              <div className="sm:hidden pt-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 bg-[#F95721] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <span>Continue to Step 5: Badges & Preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* STEP 5: MERCHANDISING BADGES & LIVE PREVIEW */}
          {/* ======================================================= */}
          <div 
            id="sec-story" 
            className={`${activeSection === 'story' ? 'block' : 'hidden sm:block'} space-y-4 pt-1 sm:pt-4 sm:border-t border-slate-100`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-xs">
                  5
                </span>
                <h3 className="text-sm font-black text-slate-900">Badges & Live Store Preview</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                Final Step
              </span>
            </div>

            {/* Merchandising Badges Grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Merchandising Badges
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'isTrending', label: 'Trending', desc: 'Hot item', icon: Flame, color: 'text-amber-500' },
                  { key: 'isBestSeller', label: 'Best Seller', desc: 'High demand', icon: Award, color: 'text-orange-500' },
                  { key: 'isDealOfDay', label: 'Deal of Day', desc: 'Homepage banner', icon: Zap, color: 'text-yellow-500' },
                  { key: 'isFeatured', label: 'Featured', desc: 'Highlighted', icon: Star, color: 'text-purple-500' },
                  { key: 'isSuperDeal', label: 'Super Deal', desc: 'Big savings', icon: Tag, color: 'text-emerald-500' },
                  { key: 'isTopRated', label: 'Top Rated', desc: 'Customer pick', icon: ShieldCheck, color: 'text-blue-500' },
                ].map(badge => {
                  const isChecked = !!(formData as any)[badge.key];
                  const Icon = badge.icon;
                  return (
                    <label 
                      key={badge.key}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all active:scale-95 ${
                        isChecked
                          ? 'bg-orange-50/90 border-[#F95721] text-[#F95721] shadow-3xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setFormData({ ...formData, [badge.key]: e.target.checked })}
                        className="w-4 h-4 rounded text-[#F95721] accent-[#F95721]"
                      />
                      <div className="min-w-0">
                        <p className="font-black leading-tight text-xs flex items-center gap-1">
                          <Icon className={`w-3.5 h-3.5 ${badge.color}`} />
                          <span>{badge.label}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{badge.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* LIVE CUSTOMER STORE PREVIEW CARD */}
            <div className="border border-slate-200/90 rounded-2xl p-3.5 bg-slate-50/60 space-y-2">
              <p className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#F95721]" />
                <span>Live SBS Store Card Preview</span>
              </p>

              <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs max-w-xs mx-auto space-y-2.5">
                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative flex items-center justify-center">
                  {formData.image || formData.images[0] ? (
                    <ResolvedImage 
                      src={formData.image || formData.images[0]} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span className="text-[11px]">No cover photo selected</span>
                    </div>
                  )}
                  {formData.isDealOfDay && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      ⚡ Deal of Day
                    </span>
                  )}
                  {formData.isBestSeller && !formData.isDealOfDay && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      ⭐ Best Seller
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {categories.find(c => c.id === formData.category)?.name || 'Catalog'}
                  </p>
                  <p className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                    {formData.name || 'Untitled Product'}
                  </p>
                  {formData.subtitle && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{formData.subtitle}</p>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-[#F95721]">
                      ₹{formData.price || '0'}
                    </span>
                    {formData.mrp && parseFloat(formData.mrp) > (parseFloat(formData.price) || 0) && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{formData.mrp}
                      </span>
                    )}
                  </div>
                  {formData.discountPercentage > 0 && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {formData.discountPercentage}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Rich Story Blocks Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Visual Story Blocks (Optional)</p>
                  <p className="text-[10px] text-slate-400">Rich marketing sections on product page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBlockForm(!showAddBlockForm)}
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#F95721] rounded-xl text-[11px] font-bold flex items-center gap-1 border border-orange-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </button>
              </div>

              {/* Story Block Form */}
              {showAddBlockForm && (
                <div className="p-3 mt-2 bg-orange-50/60 border border-orange-200/80 rounded-2xl space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Block Title (e.g. 4D Titanium Blades)"
                    value={newBlock.title}
                    onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                  />
                  <textarea
                    rows={2}
                    placeholder="Story explanation text..."
                    value={newBlock.text}
                    onChange={(e) => setNewBlock({ ...newBlock, text: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-hidden resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Image URL or S3 key (optional)"
                    value={newBlock.image}
                    onChange={(e) => setNewBlock({ ...newBlock, image: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-hidden"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddBlockForm(false)}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDescriptionBlock}
                      className="px-3.5 py-1 bg-[#F95721] text-white font-bold rounded-xl text-xs"
                    >
                      Add Block
                    </button>
                  </div>
                </div>
              )}

              {formData.descriptionBlocks.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {formData.descriptionBlocks.map((blk, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{blk.title || 'Untitled Block'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{blk.text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            descriptionBlocks: formData.descriptionBlocks.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PERSISTENT ACTION FOOTER: Touch-Optimized for Mobile & Desktop */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50/95 flex items-center justify-between gap-2.5 shrink-0 pb-safe">
          
          {/* MOBILE STEP CONTROLS (sm:hidden) */}
          <div className="flex items-center justify-between w-full sm:hidden gap-2">
            {isFirstStep ? (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition-all shadow-3xs"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition-all shadow-3xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{prevStep?.shortLabel}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              {/* Allow quick save in edit mode on intermediate steps */}
              {productToEdit && !isLastStep && (
                <button
                  type="button"
                  onClick={() => handleSaveProduct()}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl active:scale-95 transition-all"
                >
                  Save
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={() => handleSaveProduct()}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#F95721] to-[#FF7E47] text-white font-black text-xs rounded-2xl shadow-xs shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{productToEdit ? 'Save Changes' : 'Publish Product 🚀'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-black text-xs rounded-2xl shadow-xs shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Next: {nextStep?.shortLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP CONTROLS (hidden sm:flex) */}
          <div className="hidden sm:flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs min-w-0">
              {formData.price && formData.mrp ? (
                <span className="font-black text-slate-900 flex items-center gap-2">
                  <span>₹{formData.price}</span>
                  <span className="text-slate-400 line-through text-[11px]">₹{formData.mrp}</span>
                  {formData.discountPercentage > 0 && (
                    <span className="text-[#00A859] text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                      {formData.discountPercentage}% OFF
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Set price and MRP to publish
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct()}
                className="px-5 py-2 bg-[#F95721] hover:bg-[#E44813] text-white font-black text-xs rounded-xl shadow-xs shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{productToEdit ? 'Save Changes' : 'Publish Product'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={(scanned) => {
            setFormData(prev => ({
              ...prev,
              barcode: scanned,
              customId: prev.customId || scanned
            }));
            setIsScannerOpen(false);
            showToast(`Scanned Barcode: ${scanned}`);
          }}
        />
      )}

      {/* S3 Media Library Picker Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl max-h-[85dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Select S3 Media</h3>
              <button onClick={() => setIsLibraryOpen(false)} className="text-slate-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {isLoadingLibrary ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading S3 media...</div>
              ) : libraryItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No media found in S3 bucket</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {libraryItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: [...prev.images, item.key],
                          image: prev.image || item.key
                        }));
                        setIsLibraryOpen(false);
                        showToast('Asset added to product gallery');
                      }}
                      className="cursor-pointer border border-slate-200 rounded-xl overflow-hidden aspect-square p-1 hover:border-[#F95721] transition-all"
                    >
                      <ResolvedImage src={item.key} alt="S3 Asset" className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
