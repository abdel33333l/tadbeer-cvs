import React from 'react';
import { Heart, Columns, Eye, EyeOff } from 'lucide-react';

const ShortlistBar = ({ count, onCompare, onToggleShowShortlistedOnly, isShowingShortlistedOnly }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-lg animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-primary text-white rounded-2xl shadow-none px-5 py-3.5 flex items-center justify-between gap-4 border-[0.5px] border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <Heart className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-[1.5px] border-primary">
              {count}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black leading-none mb-1">المختارات</p>
            <p className="text-[9px] text-blue-300 font-bold leading-none tracking-tight">{count} عاملة جاهزة للمقارنة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleShowShortlistedOnly}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 ${isShowingShortlistedOnly ? 'bg-yellow-500 text-primary' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {isShowingShortlistedOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isShowingShortlistedOnly ? 'عرض الكل' : 'عرض المختارات'}
          </button>

          <button 
            onClick={onCompare}
            disabled={count < 2 || count > 3}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 ${count >= 2 && count <= 3 ? 'bg-accent text-white hover:bg-opacity-90' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
          >
            <Columns className="w-3.5 h-3.5" />
            مقارنة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortlistBar;
