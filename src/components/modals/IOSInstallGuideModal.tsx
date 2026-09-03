'use client';

import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-[#F95721] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Install SBS on iOS</h3>
              <p className="text-xs text-gray-500">Add to your Home Screen in 3 easy steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 py-2">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
            <div className="w-7 h-7 rounded-xl bg-[#F95721] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="text-xs text-gray-700">
              <p className="font-bold text-gray-900">Tap the Share button</p>
              <p className="text-gray-500 mt-0.5 flex items-center gap-1.5">
                Look for the <Share className="w-3.5 h-3.5 text-blue-600 inline" /> Share icon at the bottom of Safari.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
            <div className="w-7 h-7 rounded-xl bg-[#F95721] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="text-xs text-gray-700">
              <p className="font-bold text-gray-900">Select &quot;Add to Home Screen&quot;</p>
              <p className="text-gray-500 mt-0.5 flex items-center gap-1.5">
                Scroll down the share sheet and tap <PlusSquare className="w-3.5 h-3.5 text-gray-700 inline" /> <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
            <div className="w-7 h-7 rounded-xl bg-[#00A859] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="text-xs text-gray-700">
              <p className="font-bold text-gray-900">Tap &quot;Add&quot; in top right</p>
              <p className="text-gray-500 mt-0.5">
                Confirm by tapping <strong>Add</strong>. SBS will be added to your home screen and open in full-screen standalone mode!
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Got it!</span>
        </button>
      </div>
    </div>
  );
};
