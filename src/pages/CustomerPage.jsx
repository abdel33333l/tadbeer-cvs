import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkers } from '../hooks/useWorkers';
import { useFilters } from '../hooks/useFilters';
import FilterSidebar from '../components/FilterSidebar';
import WorkerCard from '../components/WorkerCard';
import CVModal from '../components/CVModal';
import CompareModal from '../components/CompareModal';
import { Settings, User as UserIcon, Filter, Share2, Search, X, Loader2, Copy, CheckCircle2 } from 'lucide-react';

import ShortlistBar from '../components/ShortlistBar';

const CustomerPage = () => {
  const { workers, whatsappNumber, isLoading } = useWorkers();
  const { filters, filteredWorkers, updateFilter, toggleMultiSelect, clearFilters } = useFilters(workers);
  
  useEffect(() => {
    document.title = import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول';
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const finalWorkers = useMemo(() => {
    let result = filteredWorkers;
    if (showShortlistedOnly) {
      result = result.filter(w => shortlistedIds.includes(w.Worker_No));
    }
    return result;
  }, [filteredWorkers, showShortlistedOnly, shortlistedIds]);

  const toggleShortlist = (worker) => {
    setShortlistedIds(prev => 
      prev.includes(worker.Worker_No) 
        ? prev.filter(id => id !== worker.Worker_No)
        : [...prev, worker.Worker_No]
    );
  };

  const openCV = (worker) => {
    setSelectedWorkerId(worker.Worker_No);
  };

  const selectedWorker = workers.find(w => w.Worker_No === selectedWorkerId);
  const selectedIndex = finalWorkers.findIndex(w => w.Worker_No === selectedWorkerId);

  const nextWorker = () => {
    if (selectedIndex < finalWorkers.length - 1) {
      setSelectedWorkerId(finalWorkers[selectedIndex + 1].Worker_No);
    }
  };

  const prevWorker = () => {
    if (selectedIndex > 0) {
      setSelectedWorkerId(finalWorkers[selectedIndex - 1].Worker_No);
    }
  };

  const shortlistedWorkers = workers.filter(w => shortlistedIds.includes(w.Worker_No));

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.nationalities.length > 0) count += filters.nationalities.length;
    if (filters.religions.length > 0) count += filters.religions.length;
    if (filters.maritalStatuses.length > 0) count += filters.maritalStatuses.length;
    if (filters.experiences.length > 0) count += filters.experiences.length;
    if (filters.skills.length > 0) count += filters.skills.length;
    if (filters.hasPreviousExperience) count += 1;
    if (filters.experienceCountries.length > 0) count += filters.experienceCountries.length;
    if (filters.children !== 'الكل') count += 1;
    if (filters.location !== 'الكل') count += 1;
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) count += 1;
    return count;
  }, [filters]);

  const copyResultLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <header className="bg-primary text-white py-6 shadow-xl sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </header>
        <div className="flex flex-grow lg:overflow-hidden relative">
          <div className="hidden lg:block w-80 bg-white border-l border-gray-100 p-6 space-y-8">
             {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
          </div>
          <div className="flex-grow p-4 sm:p-6 container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="aspect-[4/5] bg-gray-50 rounded-2xl animate-pulse" />
                  <div className="h-6 w-3/4 bg-gray-50 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-50 rounded animate-pulse" />
                  <div className="h-12 w-full bg-gray-50 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6 bg-surface">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <UserIcon className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-primary">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h1>
          <p className="text-gray-500 max-w-sm font-bold">لا توجد بيانات حالياً. يرجى رفع ملف العمالة من لوحة الإدارة للمتابعة.</p>
        </div>
        <Link to="/admin-tadbeer" className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20">
          الذهاب للوحة الإدارة
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="bg-primary text-white py-6 shadow-xl sticky top-0 z-40 no-print">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-black">
              <UserIcon className="w-4 h-4" />
              <span>{(import.meta.env.VITE_OFFICE_MANAGER || 'عادل')} — {(import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31')}</span>
            </div>
            <Link to="/admin-tadbeer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90" title="Settings">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-grow lg:overflow-hidden no-print relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar 
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            updateFilter={updateFilter}
            toggleMultiSelect={toggleMultiSelect}
            clearFilters={clearFilters}
            workers={workers}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <div className="lg:hidden">
          <FilterSidebar 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            updateFilter={updateFilter}
            toggleMultiSelect={toggleMultiSelect}
            clearFilters={clearFilters}
            workers={workers}
          />
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar relative">
          
          {/* Mobile Search & Action Bar */}
          <div className="sticky top-0 z-30 bg-white shadow-md lg:hidden p-4 space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="ابحث بالاسم أو الرقم..."
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-accent rounded-2xl text-base font-black outline-none transition-all"
              />
              <Search className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
              {filters.search && (
                <button 
                  onClick={() => updateFilter('search', '')}
                  className="absolute left-4 top-4 p-1 bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-base shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                <Filter className="w-5 h-5" />
                <span>فلترة</span>
                {activeFilterCount > 0 && (
                  <span className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={copyResultLink}
                className="p-4 bg-surface text-primary border-2 border-primary/20 rounded-2xl active:scale-90 transition-all shadow-sm"
                title="Share results"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Desktop Controls (Chips + Share) */}
          <div className="p-4 sm:p-6 container mx-auto flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-primary">العاملات المتاحة</h2>
                <p className="text-gray-400 font-bold">تم العثور على {finalWorkers.length} عاملة من إجمالي {workers.length}</p>
              </div>
              
              <button 
                onClick={copyResultLink}
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary/10 text-primary rounded-xl font-black hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <Copy className="w-5 h-5" />
                نسخ رابط نتائج البحث
              </button>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-xs font-black text-gray-400 ml-2 uppercase">الفلاتر:</span>
                
                {filters.nationalities.map(nat => (
                  <Chip key={nat} label={nat} onRemove={() => toggleMultiSelect('nationalities', nat)} />
                ))}
                {filters.religions.map(rel => (
                  <Chip key={rel} label={rel} onRemove={() => toggleMultiSelect('religions', rel)} />
                ))}
                {filters.experiences.map(exp => (
                  <Chip key={exp} label={exp === 'Experienced' ? 'خبيرة' : 'مبتدئة'} onRemove={() => toggleMultiSelect('experiences', exp)} />
                ))}
                {filters.skills.map(skill => (
                  <Chip key={skill} label={skill} onRemove={() => toggleMultiSelect('skills', skill)} />
                ))}
                {filters.location !== 'الكل' && (
                  <Chip label={filters.location} onRemove={() => updateFilter('location', 'الكل')} />
                )}
                
                <button 
                  onClick={clearFilters}
                  className="text-xs font-black text-red-500 hover:underline px-2 py-1"
                >
                  مسح الكل
                </button>
              </div>
            )}

            <main>
              {finalWorkers.length === 0 ? (
                <div className="py-24 text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Search className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-primary">لا توجد نتائج تطابق خيارات التصفية.</p>
                    <p className="text-gray-400 font-bold">جرب تغيير الفلاتر أو البحث بكلمات أخرى.</p>
                  </div>
                  <button 
                    onClick={clearFilters} 
                    className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20"
                  >
                    إعادة تعيين الفلاتر
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                  {finalWorkers.map(worker => (
                    <WorkerCard 
                      key={worker.Worker_No}
                      worker={worker}
                      isShortlisted={shortlistedIds.includes(worker.Worker_No)}
                      onToggleShortlist={toggleShortlist}
                      onOpenCV={openCV}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
          
          {/* Footer Spacer */}
          <div className="h-32 lg:h-12" />
        </div>
      </div>

      <ShortlistBar 
        count={shortlistedIds.length}
        onCompare={() => setIsCompareOpen(true)}
        onToggleShowShortlistedOnly={() => setShowShortlistedOnly(!showShortlistedOnly)}
        isShowingShortlistedOnly={showShortlistedOnly}
      />

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <span className="font-black text-base">تم نسخ رابط النتائج بنجاح!</span>
        </div>
      )}

      {/* Modals & Overlays */}
      <CVModal 
        worker={selectedWorker}
        isOpen={!!selectedWorkerId}
        onClose={() => setSelectedWorkerId(null)}
        onNext={nextWorker}
        onPrev={prevWorker}
        officeWhatsapp={whatsappNumber}
      />

      <CompareModal 
        workers={shortlistedWorkers}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
};

const Chip = ({ label, onRemove }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-black border border-accent/20">
    <span>{label}</span>
    <button onClick={onRemove} className="hover:bg-accent/20 rounded-full p-0.5 transition-colors">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

export default CustomerPage;
