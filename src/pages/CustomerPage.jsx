import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkers } from '../hooks/useWorkers';
import { useFilters } from '../hooks/useFilters';
import FilterSidebar from '../components/FilterSidebar';
import WorkerCard from '../components/WorkerCard';
import CVModal from '../components/CVModal';
import CompareModal from '../components/CompareModal';
import { Settings, User as UserIcon, Filter, Share2, Search, X, Loader2, Copy, CheckCircle2, Phone, MessageCircle, ArrowUpDown, Eye, EyeOff, LayoutGrid } from 'lucide-react';

import ShortlistBar from '../components/ShortlistBar';

const CustomerPage = () => {
  const { workers, whatsappNumber, isLoading } = useWorkers();
  const { filters, filteredWorkers, updateFilter, toggleMultiSelect, clearFilters } = useFilters(workers);
  
  useEffect(() => {
    document.title = import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول';
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const processedWorkers = useMemo(() => {
    let result = [...filteredWorkers];

    // Availability Filter
    if (showAvailableOnly) {
      // Assuming 'Available' or 'متاحة' is a status. If not explicitly in data, we can skip or assume all are available.
      // Based on previous code, I see badges for 'Experienced' and 'Beginner' but not explicit status.
      // However, requirement asks for it. I'll check for worker.status or assume all in Supabase are available if not marked otherwise.
      result = result.filter(w => !w.status || w.status.includes('متاحة') || w.status.toLowerCase().includes('available'));
    }

    // Shortlist Filter
    if (showShortlistedOnly) {
      result = result.filter(w => shortlistedIds.includes(w.Worker_No));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'age_asc') return parseInt(a.Age || 0) - parseInt(b.Age || 0);
      if (sortBy === 'age_desc') return parseInt(b.Age || 0) - parseInt(a.Age || 0);
      if (sortBy === 'nationality') return (a.Nationality || '').localeCompare(b.Nationality || '');
      if (sortBy === 'experience') return (b.Experience || '').localeCompare(a.Experience || '');
      return 0;
    });

    return result;
  }, [filteredWorkers, showShortlistedOnly, shortlistedIds, sortBy, showAvailableOnly]);

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
  const selectedIndex = processedWorkers.findIndex(w => w.Worker_No === selectedWorkerId);

  const nextWorker = () => {
    if (selectedIndex < processedWorkers.length - 1) {
      setSelectedWorkerId(processedWorkers[selectedIndex + 1].Worker_No);
    }
  };

  const prevWorker = () => {
    if (selectedIndex > 0) {
      setSelectedWorkerId(processedWorkers[selectedIndex - 1].Worker_No);
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
      <header className="bg-primary text-white py-4 sm:py-6 shadow-xl sticky top-0 z-40 no-print">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-black">
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{(import.meta.env.VITE_OFFICE_MANAGER || 'عادل')} — {(import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31')}</span>
                <span className="sm:hidden">{(import.meta.env.VITE_OFFICE_MANAGER || 'عادل')}</span>
              </div>
              <a href={`tel:${import.meta.env.VITE_OFFICE_PHONE || '0508368230'}`} className="text-[10px] font-black text-blue-200 hover:text-white transition-colors flex items-center gap-1 mr-2">
                <Phone className="w-3 h-3" />
                {import.meta.env.VITE_OFFICE_PHONE || '0508368230'}
              </a>
            </div>
            {/* Admin link hidden from public view, only accessible via URL */}
          </div>
        </div>
      </header>

      {/* Office Contact Banner */}
      <div className="bg-blue-50 border-b border-blue-100 py-3 no-print">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center">
          <p className="text-sm font-black text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            للحجز أو الاستفسار: {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'} — {import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31'}
          </p>
          <div className="flex items-center gap-3">
            <a href={`tel:${import.meta.env.VITE_OFFICE_PHONE || '0508368230'}`} className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-lg text-xs font-black shadow-sm active:scale-95 transition-all">
              <Phone className="w-3.5 h-3.5" />
              اتصال مباشر
            </a>
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-black shadow-sm active:scale-95 transition-all">
              <MessageCircle className="w-3.5 h-3.5" />
              واتساب
            </a>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-grow lg:overflow-hidden no-print relative">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block transition-all duration-300 ${isSidebarVisible ? 'w-80' : 'w-0 overflow-hidden opacity-0'}`}>
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
        <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar relative bg-surface/50">
          
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

          {/* Desktop Controls (Chips + Sorting) */}
          <div className="p-4 sm:p-6 container mx-auto flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-primary rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all"
                >
                  {isSidebarVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isSidebarVisible ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
                </button>
                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-black text-primary">العاملات المتاحة</h2>
                  <p className="text-gray-400 font-bold text-xs">تم العثور على {processedWorkers.length} عاملة من إجمالي {workers.length}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Available Only Toggle */}
                <button 
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black border-2 transition-all active:scale-95 ${showAvailableOnly ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  المتاحات فقط
                </button>

                {/* Sorting Dropdown */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                   <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                     <ArrowUpDown className="w-4 h-4" />
                   </div>
                   <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm font-black text-primary outline-none py-1.5 px-2 cursor-pointer"
                   >
                     <option value="newest">الأحدث</option>
                     <option value="age_asc">العمر: من الأقل</option>
                     <option value="age_desc">العمر: من الأعلى</option>
                     <option value="nationality">حسب الجنسية</option>
                     <option value="experience">حسب الخبرة</option>
                   </select>
                </div>

                <button 
                  onClick={copyResultLink}
                  className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-white border border-primary/10 text-primary rounded-xl font-black hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  نسخ الرابط
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(activeFilterCount > 0 || showAvailableOnly) && (
              <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-xs font-black text-gray-400 ml-2 uppercase">الفلاتر النشطة:</span>
                
                {showAvailableOnly && <Chip label="المتاحات فقط" onRemove={() => setShowAvailableOnly(false)} />}
                
                {filters.nationalities.map(nat => (
                  <Chip key={nat} label={nat} onRemove={() => toggleMultiSelect('nationalities', nat)} />
                ))}
                {filters.religions.map(rel => (
                  <Chip key={rel} label={rel === 'Christian' ? 'مسيحية' : 'مسلمة'} onRemove={() => toggleMultiSelect('religions', rel)} />
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
                  onClick={() => { clearFilters(); setShowAvailableOnly(false); }}
                  className="text-xs font-black text-red-500 hover:underline px-2 py-1"
                >
                  مسح الكل
                </button>
              </div>
            )}

            <main>
              {processedWorkers.length === 0 ? (
                <div className="py-24 text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Search className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-primary">لا توجد نتائج تطابق خيارات التصفية.</p>
                    <p className="text-gray-400 font-bold">جرب تغيير الفلاتر أو البحث بكلمات أخرى.</p>
                  </div>
                  <button 
                    onClick={() => { clearFilters(); setShowAvailableOnly(false); }} 
                    className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20"
                  >
                    إعادة تعيين الفلاتر
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-1 gap-6 lg:gap-8 ${isSidebarVisible ? 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
                  {processedWorkers.map(worker => (
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

      {/* Floating WhatsApp FAB */}
      <a 
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-28 left-6 sm:bottom-10 sm:left-10 z-40 bg-green-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-green-600 active:scale-95 transition-all animate-bounce-subtle no-print"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-white text-green-500" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping" />
        </div>
        <span className="font-black text-sm whitespace-nowrap">تواصل مع {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}</span>
      </a>

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

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-4 border-t border-white/10 mt-12">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-right space-y-2">
            <h2 className="text-xl font-black">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h2>
            <p className="text-blue-200 font-bold text-sm">
              {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'} — {import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31'}
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex gap-4">
               <a href={`tel:${import.meta.env.VITE_OFFICE_PHONE || '0508368230'}`} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                 <Phone className="w-6 h-6" />
               </a>
               <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230'}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-2xl transition-all border border-green-500/20">
                 <MessageCircle className="w-6 h-6" />
               </a>
            </div>
            <p className="text-blue-100 font-black text-lg" dir="ltr">
              {import.meta.env.VITE_OFFICE_PHONE || '0508368230'}
            </p>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-white/5 text-center">
           <p className="text-blue-300 text-xs font-bold">جميع الحقوق محفوظة © {new Date().getFullYear()} — {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}</p>
        </div>
      </footer>
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
