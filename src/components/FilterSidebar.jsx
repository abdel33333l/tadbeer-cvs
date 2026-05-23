import React from 'react';
import { X, Search, Check, MapPin, Globe, BookOpen, LayoutGrid, Calendar } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const FilterSidebar = ({ isOpen, onClose, filters, updateFilter, toggleMultiSelect, clearFilters, workers, activeFilterCount }) => {
  
  const getCount = (key, value) => {
    return workers.filter(w => {
      if (key === 'nationalities') return (w.nationality || w.Nationality) === value;
      if (key === 'religions') return (w.religion || w.Religion) === value;
      if (key === 'experiences') return (w.Experience || w.experience) === value;
      if (key === 'skills') return (w.skills || w.Skills || []).includes(value);
      if (key === 'experienceCountries') return (w.work_experience || w.WorkExperience || []).some(exp => exp.country === value);
      if (key === 'status') return (w.status || 'متاحة') === value;
      return false;
    }).length;
  };

  const nationalities = [...new Set(workers.map(w => w.nationality || w.Nationality))].sort();
  const religions = [...new Set(workers.map(w => w.religion || w.Religion))].sort();
  const statuses = ['متاحة', 'خبيرة', 'جديدة'];
  const allSkills = [...new Set(workers.flatMap(w => w.skills || w.Skills || []))].sort();
  const allExperienceCountries = [...new Set(workers.flatMap(w => (w.work_experience || w.WorkExperience || []).map(exp => exp.country)))].filter(Boolean).sort();

  const handleAgeChange = (index, value) => {
    const newRange = [...filters.ageRange];
    newRange[index] = parseInt(value);
    updateFilter('ageRange', newRange);
  };

  const isExp = (type) => (filters.experiences || []).includes(type);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar / Bottom Sheet */}
      <div className={`bottom-sheet lg:sticky lg:top-24 lg:translate-y-0 lg:w-[220px] lg:h-fit lg:element-radius lg:flat-border lg:z-0 lg:block flex flex-col h-[85vh] lg:h-auto ${isOpen ? 'open' : ''}`}>
        <div className="sheet-handle lg:hidden" />
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <h2 className="font-medium text-[13px] text-primary">تصفية النتائج</h2>
           </div>
           <button onClick={clearFilters} className="text-[11px] text-[#185FA5] font-medium hover:underline">مسح الكل</button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar pb-32 lg:pb-4">
          
          {/* 1. مستوى الخبرة (HIGHEST PRIORITY) */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">مستوى الخبرة</label>
            <div className="flex flex-col gap-1.5">
               <FilterChip 
                label="لديها خبرة" active={isExp('Experienced')} 
                onClick={() => toggleMultiSelect('experiences', 'Experienced')} 
                count={getCount('experiences', 'Experienced')}
                activeStyles="bg-[#EAF3DE] border-[#27500A] text-[#27500A]"
               />
               <FilterChip 
                label="بدون خبرة" active={isExp('Beginner')} 
                onClick={() => toggleMultiSelect('experiences', 'Beginner')} 
                count={getCount('experiences', 'Beginner')}
                activeStyles="bg-[#FAEEDA] border-[#633806] text-[#633806]"
               />
            </div>
          </div>

          {/* 2. الجنسية */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">الجنسية</label>
            <div className="flex flex-wrap gap-1.5">
              {nationalities.map(nat => (
                <button 
                  key={nat}
                  onClick={() => toggleMultiSelect('nationalities', nat)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 pill-radius border-[0.5px] text-[11px] font-medium transition-all ${filters.nationalities.includes(nat) ? 'bg-[#E6F1FB] border-[#378ADD] text-[#0C447C]' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  <span>{getFlagEmoji(nat)}</span>
                  <span>{nat}</span>
                  <span className="opacity-40 text-[9px]">({getCount('nationalities', nat)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. الحالة */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">الحالة</label>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(s => (
                <FilterChip 
                  key={s} label={s} active={(filters.status || []).includes(s)}
                  onClick={() => toggleMultiSelect('status', s)}
                  count={getCount('status', s)}
                />
              ))}
            </div>
          </div>

          {/* 4. الديانة */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">الديانة</label>
            <div className="flex flex-wrap gap-1.5">
              {religions.map(r => (
                <FilterChip 
                  key={r} label={r === 'Christian' ? 'مسيحية' : r === 'Muslim' ? 'مسلمة' : r} 
                  active={(filters.religions || []).includes(r)}
                  onClick={() => toggleMultiSelect('religions', r)}
                  count={getCount('religions', r)}
                />
              ))}
            </div>
          </div>

          {/* 5. الفئة العمرية */}
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">الفئة العمرية</label>
                <div className="text-[11px] font-medium text-primary">{filters.ageRange[0]} إلى {filters.ageRange[1]} سنة</div>
             </div>
             <div className="relative h-1 bg-gray-100 pill-radius">
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

          {/* 6. المهارات */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">المهارات</label>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map(s => (
                <FilterChip 
                  key={s} label={s} active={(filters.skills || []).includes(s)}
                  onClick={() => toggleMultiSelect('skills', s)}
                  count={getCount('skills', s)}
                />
              ))}
            </div>
          </div>

          {/* 7. خبرة سابقة في */}
          {allExperienceCountries.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">خبرة سابقة في</label>
              <div className="flex flex-wrap gap-1.5">
                {allExperienceCountries.map(c => (
                  <FilterChip 
                    key={c} label={c} active={(filters.experienceCountries || []).includes(c)}
                    onClick={() => toggleMultiSelect('experienceCountries', c)}
                    count={getCount('experienceCountries', c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Apply Button (Mobile Only) */}
        <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 lg:hidden">
          <button 
            onClick={onClose}
            className="w-full h-[44px] bg-primary text-white element-radius font-medium text-[13px] active:opacity-90"
          >
            تطبيق الفلتر ({activeFilterCount} عاملة)
          </button>
        </div>
      </div>
    </>
  );
};

const FilterChip = ({ label, active, onClick, count, activeStyles }) => {
  const defaultActive = "bg-[#E6F1FB] border-[#378ADD] text-[#0C447C]";
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 pill-radius border-[0.5px] text-[11px] font-medium transition-all ${active ? (activeStyles || defaultActive) : 'bg-white border-gray-200 text-gray-600'}`}
    >
      {label} <span className="opacity-40 text-[9px]">({count})</span>
    </button>
  );
};

export default FilterSidebar;
