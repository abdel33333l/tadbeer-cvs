import React from 'react';
import { X, Search, ChevronDown, Check } from 'lucide-react';

const FilterSidebar = ({ isOpen, onClose, filters, updateFilter, toggleMultiSelect, clearFilters, workers }) => {
  // Extract dynamic options
  const nationalities = [...new Set(workers.map(w => w.Nationality))].sort();
  const religions = [...new Set(workers.map(w => w.Religion))].sort();
  const maritalStatuses = [...new Set(workers.map(w => w.Marital_Status))].sort();
  const experiences = [...new Set(workers.map(w => w.Experience))].sort();
  const allSkills = [...new Set(workers.flatMap(w => w.Skills))].sort();
  const allLanguages = [...new Set(workers.flatMap(w => w.Languages))].sort();
  const allExperienceCountries = [...new Set(workers.flatMap(w => (w.WorkExperience || []).map(exp => exp.country)))].filter(Boolean).sort();

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
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar / Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:sticky lg:top-24 lg:translate-x-0 lg:shadow-none lg:z-0 lg:border-l lg:border-gray-100 lg:h-[calc(100vh-6rem)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="font-black text-xl text-primary">تصفية النتائج</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={clearFilters}
                className="text-sm text-red-500 font-black hover:underline px-2 py-1"
              >
                مسح الكل
              </button>
              <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors lg:hidden">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filters List */}
          <div className="flex-grow overflow-y-auto p-5 space-y-8 custom-scrollbar pb-32">
            {/* Search */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">البحث بالاسم أو الرقم</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="ابحث بالاسم، الرقم، أو الجنسية..."
                  className="w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-accent rounded-2xl text-base font-bold transition-all outline-none shadow-sm"
                />
                <Search className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Nationality */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">الجنسية</label>
              <div className="grid grid-cols-1 gap-2">
                {nationalities.map(nat => (
                  <label key={nat} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${filters.nationalities.includes(nat) ? 'border-accent bg-accent/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">{nat}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={filters.nationalities.includes(nat)}
                      onChange={() => toggleMultiSelect('nationalities', nat)}
                      className="hidden"
                    />
                    {filters.nationalities.includes(nat) && <Check className="w-5 h-5 text-accent stroke-[3]" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest block">
                العمر <span className="text-accent text-lg mx-1">{filters.ageRange[0]}</span> إلى <span className="text-accent text-lg mx-1">{filters.ageRange[1]}</span> سنة
              </label>
              <div className="px-2 space-y-6">
                <div className="relative h-2 bg-gray-100 rounded-full">
                   {/* Visual indicator for range would go here if using a real dual-range slider */}
                   <input 
                    type="range" 
                    min="18" max="60" 
                    value={filters.ageRange[0]}
                    onChange={(e) => handleAgeChange(0, e.target.value)}
                    className="absolute inset-0 w-full h-2 bg-transparent appearance-none cursor-pointer accent-accent z-20 pointer-events-auto"
                  />
                  <input 
                    type="range" 
                    min="18" max="60" 
                    value={filters.ageRange[1]}
                    onChange={(e) => handleAgeChange(1, e.target.value)}
                    className="absolute inset-0 w-full h-2 bg-transparent appearance-none cursor-pointer accent-accent z-10 pointer-events-auto"
                  />
                </div>
                <div className="flex justify-between text-xs font-black text-gray-400">
                  <span>18</span>
                  <span>60</span>
                </div>
              </div>
            </div>

            {/* Religion */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">الدين</label>
              <div className="flex flex-wrap gap-2">
                {religions.map(rel => (
                  <button 
                    key={rel}
                    onClick={() => toggleMultiSelect('religions', rel)}
                    className={`px-5 py-3 rounded-xl text-sm font-black border-2 transition-all ${filters.religions.includes(rel) ? 'bg-accent border-accent text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                  >
                    {rel === 'Christian' ? 'مسيحية' : rel === 'Muslim' ? 'مسلمة' : rel}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">الخبرة</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => toggleMultiSelect('experiences', 'Experienced')}
                  className={`py-4 rounded-xl text-sm font-black border-2 transition-all ${filters.experiences.includes('Experienced') ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                >
                  خبيرة
                </button>
                <button 
                  onClick={() => toggleMultiSelect('experiences', 'Beginner')}
                  className={`py-4 rounded-xl text-sm font-black border-2 transition-all ${filters.experiences.includes('Beginner') ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                >
                  مبتدئة
                </button>
              </div>
            </div>

            {/* Previous Experience Checkbox */}
            <div className="pt-2">
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${filters.hasPreviousExperience ? 'border-accent bg-accent/5' : 'border-gray-100 bg-white'}`}>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${filters.hasPreviousExperience ? 'bg-accent border-accent' : 'border-gray-300'}`}>
                  {filters.hasPreviousExperience && <Check className="w-4 h-4 text-white stroke-[4]" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={filters.hasPreviousExperience}
                  onChange={(e) => updateFilter('hasPreviousExperience', e.target.checked)}
                  className="hidden"
                />
                <span className="text-base font-black text-primary">لديها خبرة سابقة مسجلة</span>
              </label>
            </div>

            {/* Experience Countries */}
            {allExperienceCountries.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">دولة الخبرة السابقة</label>
                <div className="grid grid-cols-1 gap-2">
                  {allExperienceCountries.map(country => (
                    <label key={country} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${filters.experienceCountries.includes(country) ? 'border-accent bg-accent/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                      <span className="text-base font-bold text-primary">{country}</span>
                      <input 
                        type="checkbox" 
                        checked={filters.experienceCountries.includes(country)}
                        onChange={() => toggleMultiSelect('experienceCountries', country)}
                        className="hidden"
                      />
                      {filters.experienceCountries.includes(country) && <Check className="w-5 h-5 text-accent stroke-[3]" />}
                    </label>
                  ))}
                </div>
              </div>
            )}


            {/* Skills */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">المهارات</label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button 
                    key={skill}
                    onClick={() => toggleMultiSelect('skills', skill)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${filters.skills.includes(skill) ? 'bg-primary border-primary text-white shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Children */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">عدد الأطفال</label>
              <div className="grid grid-cols-4 gap-2">
                {['الكل', '0', '1', '2', '3+'].map(val => (
                  <button 
                    key={val}
                    onClick={() => updateFilter('children', val)}
                    className={`py-3 rounded-xl text-sm font-black border-2 transition-all ${filters.children === val ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-100 text-gray-500'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">الموقع</label>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'الكل', value: 'الكل' },
                  { label: 'داخل الدولة', value: 'داخل الدولة' },
                  { label: 'خارج الدولة', value: 'خارج الدولة' }
                ].map(loc => (
                  <button 
                    key={loc.value}
                    onClick={() => updateFilter('location', loc.value)}
                    className={`py-4 rounded-xl text-base font-black border-2 transition-all text-right px-5 ${filters.location === loc.value ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-100 text-gray-500'}`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer Drawer Sticky */}
          <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button 
              onClick={onClose}
              className="w-full py-5 bg-accent text-white rounded-2xl font-black text-lg shadow-xl shadow-accent/20 active:scale-95 transition-all"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
