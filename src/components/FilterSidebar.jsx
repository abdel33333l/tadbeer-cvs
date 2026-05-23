import React from 'react';
import { X, Search, ChevronDown, Check } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const FilterSidebar = ({ isOpen, onClose, filters, updateFilter, toggleMultiSelect, clearFilters, workers }) => {
  // Extract dynamic options with counts
  const getCount = (key, value) => {
    return workers.filter(w => {
      if (key === 'nationalities') return w.nationality === value || w.Nationality === value;
      if (key === 'religions') return w.religion === value || w.Religion === value;
      if (key === 'experiences') return w.experience === value || w.Experience === value;
      if (key === 'skills') return (w.skills || w.Skills || []).includes(value);
      return false;
    }).length;
  };

  const nationalities = [...new Set(workers.map(w => w.nationality || w.Nationality))].sort();
  const religions = [...new Set(workers.map(w => w.religion || w.Religion))].sort();
  const allSkills = [...new Set(workers.flatMap(w => w.skills || w.Skills || []))].sort();

  const handleAgeChange = (index, value) => {
    const newRange = [...filters.ageRange];
    newRange[index] = parseInt(value);
    updateFilter('ageRange', newRange);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet Filter */}
      <div className={`bottom-sheet z-[100] h-[85vh] flex flex-col ${isOpen ? 'open' : ''}`}>
        <div className="sheet-handle" />
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <h2 className="font-black text-lg text-primary">تصفية النتائج</h2>
              <button onClick={clearFilters} className="text-[10px] text-red-500 font-black px-2 py-1 bg-red-50 rounded-lg">مسح الكل</button>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-8 custom-scrollbar pb-32">
          {/* Nationality Flag Chips */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الجنسية</label>
            <div className="flex flex-wrap gap-2">
              {nationalities.map(nat => {
                const active = filters.nationalities.includes(nat);
                const count = getCount('nationalities', nat);
                return (
                  <button 
                    key={nat}
                    onClick={() => toggleMultiSelect('nationalities', nat)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-[0.5px] transition-all ${active ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    <span className="text-xl">{getFlagEmoji(nat)}</span>
                    <span className="text-xs font-black">{nat}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Dual Slider */}
          <div className="space-y-6 px-1">
             <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">العمر</label>
                <div className="font-black text-primary text-xs">{filters.ageRange[0]} — {filters.ageRange[1]} سنة</div>
             </div>
             <div className="relative h-1 bg-gray-100 rounded-full">
                <input 
                  type="range" min="18" max="60" value={filters.ageRange[0]}
                  onChange={(e) => handleAgeChange(0, e.target.value)}
                  className="absolute inset-0 w-full h-1 bg-transparent appearance-none cursor-pointer accent-accent z-20 pointer-events-auto"
                />
                <input 
                  type="range" min="18" max="60" value={filters.ageRange[1]}
                  onChange={(e) => handleAgeChange(1, e.target.value)}
                  className="absolute inset-0 w-full h-1 bg-transparent appearance-none cursor-pointer accent-accent z-10 pointer-events-auto"
                />
             </div>
          </div>

          {/* Religion Chips */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الديانة</label>
            <div className="flex flex-wrap gap-2">
              {religions.map(rel => {
                const active = filters.religions.includes(rel);
                const count = getCount('religions', rel);
                return (
                  <button 
                    key={rel}
                    onClick={() => toggleMultiSelect('religions', rel)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-[0.5px] transition-all ${active ? 'bg-accent border-accent text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {rel === 'Christian' ? 'مسيحية' : rel === 'Muslim' ? 'مسلمة' : rel}
                    <span className="mr-2 opacity-60 text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills Chips */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المهارات</label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => {
                const active = filters.skills.includes(skill);
                const count = getCount('skills', skill);
                return (
                  <button 
                    key={skill}
                    onClick={() => toggleMultiSelect('skills', skill)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border-[0.5px] transition-all ${active ? 'bg-primary border-primary text-white' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                  >
                    {skill}
                    <span className="mr-1 opacity-50">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Apply Button */}
        <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm tap-target active:opacity-90 transition-opacity"
          >
            تطبيق الفلتر
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
