import React, { useState } from 'react';
import { LayoutGrid, List, Filter, Link as LinkIcon, Check } from 'lucide-react';

const StatsBar = ({ currentCount, totalCount, viewMode, setViewMode, onOpenFilters }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">
          عرض <span className="text-primary font-bold">{currentCount}</span> من <span className="text-primary font-bold">{totalCount}</span> عاملة
        </div>

        <div className="flex items-center gap-3">
          {/* Share Link Button */}
          <button 
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded border text-xs font-bold transition-colors ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'تم النسخ!' : 'نسخ رابط الفلتر'}</span>
          </button>

          {/* View Toggles */}
          <div className="flex bg-gray-100 rounded p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="شبكة"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="قائمة"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Button (Mobile/Tablet) */}
          <button 
            onClick={onOpenFilters}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-surface border border-gray-200 rounded text-primary text-sm font-bold"
          >
            <Filter className="w-4 h-4" />
            تصفية
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
