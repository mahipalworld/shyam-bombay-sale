'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Cloud, 
  HardDrive, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  Play, 
  X, 
  Film, 
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { S3MediaItem, StorageStatus } from '@/types';
import { 
  checkStorageStatus, 
  listS3Files, 
  uploadMediaToS3, 
  deleteS3File, 
  resolveMediaUrl 
} from '@/lib/mediaStorage';

export const MediaStorageView: React.FC = () => {
  const { showToast } = useStore();

  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [items, setItems] = useState<S3MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active preview modal
  const [activePreview, setActivePreview] = useState<S3MediaItem | null>(null);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Initial load
  const loadStorageData = async () => {
    try {
      setIsRefreshing(true);
      const [storageStatus, filesRes] = await Promise.all([
        checkStorageStatus(),
        listS3Files('products/').catch(() => ({ items: [], count: 0, bucket: '', region: '' }))
      ]);

      setStatus(storageStatus);
      setItems(filesRes.items || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load storage details', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (typeFilter === 'IMAGE' && item.type !== 'image') return false;
    if (typeFilter === 'VIDEO' && item.type !== 'video') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q);
    }
    return true;
  });

  // Storage metrics
  const imageCount = items.filter((i) => i.type === 'image').length;
  const videoCount = items.filter((i) => i.type === 'video').length;
  const totalSizeBytes = items.reduce((sum, item) => sum + (item.size || 0), 0);
  const totalStorageFormatted = (totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';

  // Handle direct file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const category = isVideo ? 'videos' : 'images';

    try {
      setUploadingName(file.name);
      setUploadProgress(0);

      const result = await uploadMediaToS3(file, category, (pct) => {
        setUploadProgress(pct);
      });

      showToast(`Uploaded ${file.name} successfully!`, 'success');
      setUploadProgress(null);
      setUploadingName('');

      // Refresh files
      loadStorageData();
    } catch (err: any) {
      setUploadProgress(null);
      setUploadingName('');
      showToast(err.message || 'Upload failed', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (key: string) => {
    try {
      setIsDeleting(true);
      await deleteS3File(key);
      showToast('Media object deleted from S3', 'info');
      setDeleteConfirmKey(null);
      if (activePreview?.key === key) setActivePreview(null);
      setItems((prev) => prev.filter((i) => i.key !== key));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete file', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL / Key to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#F95721] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900 tracking-tight">
                Product Media & AWS Storage
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#F95721] flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Private S3
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Secure object storage in <span className="font-semibold text-gray-700">ap-south-1</span> with byte-range video streaming
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStorageData}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh bucket files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F95721]' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Media</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Storage Architecture Overview & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Connection Status Card */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Storage Backend
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${status?.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-black text-gray-900">
              {status?.status === 'connected' ? 'AWS S3 Connected' : 'Local / Demo Mode'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono truncate">
            Bucket: {status?.bucket || 'sbs-store-media-748439418595'}
          </p>
        </div>

        {/* Total Objects Card */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total S3 Objects
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {items.length}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F95721] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-gray-500">
            {imageCount} Images • {videoCount} Videos
          </p>
        </div>

        {/* Total Storage Used */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Storage Footprint
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {totalStorageFormatted}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-gray-500">
            Region: ap-south-1 (Mumbai)
          </p>
        </div>

        {/* Delivery Strategy */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Delivery Strategy
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-gray-900 truncate">
              {status?.cloudfrontEnabled ? 'CloudFront CDN' : 'Signed S3 Delivery'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            Byte-range seeking enabled
          </p>
        </div>
      </div>

      {/* Active Upload Progress Banner */}
      {uploadProgress !== null && (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-4 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-gray-900">
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#F95721] animate-bounce" />
              Direct Uploading to AWS S3: <span className="font-mono text-gray-700">{uploadingName}</span>
            </span>
            <span className="text-[#F95721] font-black">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-orange-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#F95721] to-[#FF7E47] rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Media Library Explorer Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setTypeFilter('IMAGE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                typeFilter === 'IMAGE'
                  ? 'bg-white text-[#F95721] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images ({imageCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter('VIDEO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                typeFilter === 'VIDEO'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({videoCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by file name or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:border-[#F95721] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-[#F95721] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold">Scanning S3 bucket objects...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">No media found</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {searchQuery ? 'Try adjusting your search query' : 'Upload your first product photo or demo video above'}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl active:scale-95 transition-all"
            >
              Select File to Upload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredItems.map((item) => {
              const isVideo = item.type === 'video';
              return (
                <div
                  key={item.key}
                  className="group relative bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail / Media Canvas */}
                  <div 
                    onClick={() => setActivePreview(item)}
                    className="aspect-square w-full bg-gray-50 p-2 flex items-center justify-center relative cursor-pointer overflow-hidden"
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl relative group-hover:scale-105 transition-transform duration-300">
                        <Video className="w-8 h-8 text-white/80" />
                        <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase text-white bg-red-600 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <Film className="w-2.5 h-2.5" /> Video
                        </span>
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-[#F95721] flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Metadata info */}
                  <div className="p-2.5 border-t border-gray-100 bg-white space-y-1">
                    <p className="text-[11px] font-bold text-gray-900 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{(item.size / 1024).toFixed(0)} KB</span>
                      <span className="font-mono">{item.type.toUpperCase()}</span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center justify-between pt-1 gap-1 border-t border-gray-50">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.key, item.key)}
                        className="p-1.5 text-gray-500 hover:text-[#F95721] hover:bg-orange-50 rounded-lg transition-colors"
                        title="Copy canonical S3 key"
                      >
                        {copiedKey === item.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActivePreview(item)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmKey(item.key)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete from S3"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal (Image Lightbox & Video Player) */}
      {activePreview && (
        <div 
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActivePreview(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-gray-900 truncate max-w-md">
                  {activePreview.name}
                </h3>
                <p className="text-[11px] font-mono text-gray-500">
                  Key: {activePreview.key}
                </p>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player / Canvas */}
            <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center">
              {activePreview.type === 'video' ? (
                <video
                  src={activePreview.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePreview.url}
                  alt={activePreview.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-xs text-gray-500">
                Size: {(activePreview.size / (1024 * 1024)).toFixed(2)} MB • Bucket: {status?.bucket}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleCopy(activePreview.key, activePreview.key)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Canonical Key</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmKey(activePreview.key)}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmKey && (
        <div 
          className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDeleteConfirmKey(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-gray-900">
                Delete Object from AWS S3?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-mono truncate px-2">
                {deleteConfirmKey}
              </p>
              <p className="text-[11px] text-gray-500 pt-1">
                This action is permanent and will remove the file from your S3 bucket.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmKey(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmKey)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
