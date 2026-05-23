import React, { useState, useMemo, useEffect } from 'react';
import { useWorkers } from '../hooks/useWorkers';
import { useFilters } from '../hooks/useFilters';
import FilterSidebar from '../components/FilterSidebar';
import WorkerCard from '../components/WorkerCard';
import CVModal from '../components/CVModal';
import { Search, Filter as FilterIcon, Home, Heart, FileText, User, Loader2, ArrowUpDown, ChevronDown } from 'lucide-react';

const CustomerPage = () => {
  const { workers, whatsappNumber, isLoading } = useWorkers();
  const { filters, filteredWorkers, updateFilter, toggleMultiSelect, clearFilters } = useFilters(workers);
  
  useEffect(() => {
    document.title = import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول';
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [shortlistedIds, setShortlistedIds] = useState(() => {
     const saved = localStorage.getItem('tadbeer_favorites');
     return saved ? JSON.parse(saved) : [];
  });
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    localStorage.setItem('tadbeer_favorites', JSON.stringify(shortlistedIds));
  }, [shortlistedIds]);

  // EXPERIENCE QUICK-TABS LOGIC
  const activeExpFilter = filters.experiences?.[0] || 'all';
  const handleExpTab = (val) => {
    if (val === 'all') updateFilter('experiences', []);
    else updateFilter('experiences', [val]);
  };

  const processedWorkers = useMemo(() => {
    let result = [...filteredWorkers];
    if (activeTab === 'favorites') {
      result = result.filter(w => shortlistedIds.includes(w.worker_code || w.Worker_No));
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'age_asc') return parseInt(a.age || a.Age || 0) - parseInt(b.age || b.Age || 0);
      if (sortBy === 'exp') return (b.experience || b.Experience || '').localeCompare(a.experience || a.Experience || '');
      return 0;
    });

    return result;
  }, [filteredWorkers, activeTab, shortlistedIds, sortBy]);

  const toggleShortlist = (worker) => {
    const code = worker.worker_code || worker.Worker_No;
    setShortlistedIds(prev => prev.includes(code) ? prev.filter(id => id !== code) : [...prev, code]);
  };

  const openCV = (worker) => setSelectedWorkerId(worker.worker_code || worker.Worker_No);
  const selectedWorker = workers.find(w => (w.worker_code || w.Worker_No) === selectedWorkerId);
  const selectedIndex = processedWorkers.findIndex(w => (w.worker_code || w.Worker_No) === selectedWorkerId);

  const nextWorker = () => {
    if (selectedIndex < processedWorkers.length - 1) setSelectedWorkerId(processedWorkers[selectedIndex + 1].worker_code || processedWorkers[selectedIndex + 1].Worker_No);
  };
  const prevWorker = () => {
    if (selectedIndex > 0) setSelectedWorkerId(processedWorkers[selectedIndex - 1].worker_code || processedWorkers[selectedIndex - 1].Worker_No);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface select-none">
      
      {/* Desktop Topbar */}
      <header className="bg-white border-b border-gray-100 p-3 sticky top-0 z-50 no-print">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo Right */}
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg">T</div>
             <h1 className="text-sm font-medium text-primary hidden sm:block">بوابة عاملات منزليات</h1>
          </div>

          {/* Search Center (Max 400px) */}
          <div className="relative w-full max-w-[400px]">
            <input 
              type="text" value={filters.search} onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="ابحث بالاسم أو الرقم..."
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border-[0.5px] border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-accent transition-all"
            />
            <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          {/* User Info Left / Filter Toggle Mobile */}
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-[0.5px] border-gray-200 rounded-xl text-[11px] font-medium">
               <User className="w-3.5 h-3.5 text-gray-400" />
               <span>{import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}</span>
             </div>
             <button onClick={() => setIsFilterOpen(true)} className="lg:hidden tap-target flex items-center justify-center bg-primary text-white rounded-xl px-3"><FilterIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-grow container mx-auto p-4 lg:p-6 gap-6 relative">
        
        {/* Filter Sidebar (Desktop Right) */}
        <FilterSidebar 
          isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}
          filters={filters} updateFilter={updateFilter} toggleMultiSelect={toggleMultiSelect}
          clearFilters={clearFilters} workers={workers} activeFilterCount={processedWorkers.length}
        />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col space-y-4">
          
          {/* Toolbar Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 element-radius border-[0.5px] border-gray-100">
            {/* Experience Quick-Tabs (Highest Priority) */}
            <div className="flex p-1 bg-gray-50 rounded-xl w-full sm:w-auto">
               <ExpTab label="الكل" active={activeExpFilter === 'all'} onClick={() => handleExpTab('all')} />
               <ExpTab label="لديها خبرة" active={activeExpFilter === 'Experienced'} onClick={() => handleExpTab('Experienced')} activeStyles="bg-[#EAF3DE] text-[#27500A]" />
               <ExpTab label="بدون خبرة" active={activeExpFilter === 'Beginner'} onClick={() => handleExpTab('Beginner')} activeStyles="bg-[#FAEEDA] text-[#633806]" />
            </div>

            {/* Sort Dropdown (Pushed to left) */}
            <div className="relative mr-auto w-full sm:w-auto">
               <select 
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full sm:w-40 bg-white border-[0.5px] border-gray-200 px-4 py-2 rounded-xl text-[11px] font-medium outline-none cursor-pointer"
               >
                 <option value="newest">الأحدث</option>
                 <option value="age_asc">الأصغر سناً</option>
                 <option value="exp">الأكثر خبرة</option>
               </select>
               <ChevronDown className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Results Count below toolbar */}
          <p className="text-[13px] text-gray-400">عرض <span className="font-medium text-primary">{processedWorkers.length}</span> عاملة متاحة</p>

          {/* Card Grid */}
          {processedWorkers.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <p className="text-gray-400 font-medium">لا توجد عاملات بهذه المعايير</p>
               <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-medium active:opacity-90">تخفيف الفلاتر</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-[14px]">
              {processedWorkers.map(worker => (
                <WorkerCard 
                  key={worker.worker_code || worker.Worker_No}
                  worker={worker}
                  isShortlisted={shortlistedIds.includes(worker.worker_code || worker.Worker_No)}
                  onToggleShortlist={toggleShortlist}
                  onOpenCV={openCV}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 flex justify-around items-center p-3 lg:hidden">
        <NavBtn icon={<Home />} label="الرئيسية" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavBtn icon={<Heart />} label="المفضلة" active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
        <NavBtn icon={<FileText />} label="طلباتي" />
        <NavBtn icon={<User />} label="حسابي" />
      </nav>

      <CVModal 
        worker={selectedWorker} isOpen={!!selectedWorkerId} onClose={() => setSelectedWorkerId(null)}
        onNext={nextWorker} onPrev={prevWorker} officeWhatsapp={whatsappNumber}
      />
    </div>
  );
};

const ExpTab = ({ label, active, onClick, activeStyles }) => (
  <button 
    onClick={onClick}
    className={`flex-1 sm:px-4 py-2 rounded-lg text-[11px] font-medium transition-all ${active ? (activeStyles || 'bg-white text-primary') : 'text-gray-400 hover:text-gray-600'}`}
  >
    {label}
  </button>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 tap-target transition-colors ${active ? 'text-primary' : 'text-gray-300'}`}>
    {React.cloneElement(icon, { className: "w-5 h-5" })}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default CustomerPage;
