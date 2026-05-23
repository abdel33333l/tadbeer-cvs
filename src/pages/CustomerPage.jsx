import React, { useState, useMemo, useEffect } from 'react';
import { useWorkers } from '../hooks/useWorkers';
import { useFilters } from '../hooks/useFilters';
import FilterSidebar from '../components/FilterSidebar';
import WorkerCard from '../components/WorkerCard';
import CVModal from '../components/CVModal';
import { Search, Filter, Home, Heart, FileText, User, Loader2 } from 'lucide-react';

const CustomerPage = () => {
  const { workers, whatsappNumber, isLoading } = useWorkers();
  const { filters, filteredWorkers, updateFilter, toggleMultiSelect, clearFilters } = useFilters(workers);
  
  useEffect(() => {
    document.title = import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول';
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  const displayWorkers = useMemo(() => {
    if (activeTab === 'favorites') {
      return filteredWorkers.filter(w => shortlistedIds.includes(w.worker_code || w.Worker_No));
    }
    return filteredWorkers;
  }, [filteredWorkers, activeTab, shortlistedIds]);

  const toggleShortlist = (worker) => {
    const code = worker.worker_code || worker.Worker_No;
    setShortlistedIds(prev => 
      prev.includes(code) ? prev.filter(id => id !== code) : [...prev, code]
    );
  };

  const openCV = (worker) => {
    setSelectedWorkerId(worker.worker_code || worker.Worker_No);
  };

  const selectedWorker = workers.find(w => (w.worker_code || w.Worker_No) === selectedWorkerId);
  const selectedIndex = displayWorkers.findIndex(w => (w.worker_code || w.Worker_No) === selectedWorkerId);

  const nextWorker = () => {
    if (selectedIndex < displayWorkers.length - 1) {
      setSelectedWorkerId(displayWorkers[selectedIndex + 1].worker_code || displayWorkers[selectedIndex + 1].Worker_No);
    }
  };

  const prevWorker = () => {
    if (selectedIndex > 0) {
      setSelectedWorkerId(displayWorkers[selectedIndex - 1].worker_code || displayWorkers[selectedIndex - 1].Worker_No);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface select-none overflow-x-hidden">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 p-3 sm:p-4">
        <div className="max-w-[500px] mx-auto flex items-center gap-3">
          <div className="relative flex-grow">
            <input 
              type="text" 
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="ابحث بالاسم أو الرقم..."
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border-[0.5px] border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-accent transition-all"
            />
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="tap-target bg-primary text-white rounded-2xl px-3 border-none active:opacity-80 transition-opacity"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Feed */}
      <main className="flex-grow max-w-[500px] mx-auto w-full pb-32">
        <div className="p-1">
          <p className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
            {activeTab === 'home' ? `عرض ${displayWorkers.length} عاملة متاحة` : `${displayWorkers.length} عاملة في المفضلة`}
          </p>
          
          {displayWorkers.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <p className="text-gray-400 font-bold">لا توجد نتائج مطابقة</p>
               <button onClick={clearFilters} className="text-primary font-black text-xs underline">تخفيف الفلاتر</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 bg-white rounded-t-3xl overflow-hidden border-t border-gray-100">
              {displayWorkers.map(worker => (
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
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 pt-3 pb-safe-area-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-[500px] mx-auto flex items-center justify-between">
          <NavButton icon={<Home />} label="الرئيسية" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<Heart />} label="المفضلة" active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
          <NavButton icon={<FileText />} label="طلباتي" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
          <NavButton icon={<User />} label="حسابي" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
        </div>
      </nav>

      {/* Components */}
      <FilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        updateFilter={updateFilter}
        toggleMultiSelect={toggleMultiSelect}
        clearFilters={clearFilters}
        workers={workers}
      />

      <CVModal 
        worker={selectedWorker}
        isOpen={!!selectedWorkerId}
        onClose={() => setSelectedWorkerId(null)}
        onNext={nextWorker}
        onPrev={prevWorker}
        officeWhatsapp={whatsappNumber}
      />
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 tap-target border-none bg-transparent transition-all ${active ? 'text-primary scale-110' : 'text-gray-300'}`}
  >
    {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'fill-current' : ''}` })}
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default CustomerPage;
