import React from 'react';
import { Heart, Columns, Eye, EyeOff } from 'lucide-react';

const ShortlistBar = ({ count, onCompare, onToggleShowShortlistedOnly, isShowingShortlistedOnly }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-lg animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-primary/95 backdrop-blur-md text-white rounded-[2rem] shadow-2xl px-6 py-4 flex items-center justify-between gap-4 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-white/10 rounded-full">
              <Heart className="w-6 h-6 fill-yellow-500 text-yellow-500" />
            </div>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">
              {count}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-black leading-none mb-0.5">قائمة المختارات</p>
            <p className="text-[10px] text-blue-200 font-bold leading-none">{count} عاملات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleShowShortlistedOnly}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${isShowingShortlistedOnly ? 'bg-yellow-500 text-primary shadow-lg shadow-yellow-500/20' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {isShowingShortlistedOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isShowingShortlistedOnly ? 'عرض الكل' : 'عرض المختارات'}
          </button>

          <button 
            onClick={onCompare}
            disabled={count < 2 || count > 3}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${count >= 2 && count <= 3 ? 'bg-accent text-white hover:bg-opacity-90 shadow-lg shadow-accent/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
          >
            <Columns className="w-4 h-4" />
            مقارنة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortlistBar;
