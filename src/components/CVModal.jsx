import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Printer, MessageCircle, Phone, PhoneCall, ZoomIn, Calendar, Globe, User as UserIcon, BookOpen, Briefcase, Ruler, Weight, Activity, Heart, Award, MapPin } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';
import { buildWhatsAppUrl, buildOfficeWhatsAppUrl } from '../utils/whatsapp';
import { getNormalizedSkills, getNormalizedLanguages, getWorkerPhone, getWorkerSkills, getWorkerLanguages } from '../utils/normalization';

const formatPeriod = (raw) => {
  if (!raw) return '';
  const p = raw.toUpperCase().replace(/\s+/g, '');
  if (p === '2YRS' || p === '2YEARS' || p === '2YR') return 'سنتان';
  if (p === '1YRS' || p === '1YEAR' || p === '1YR') return 'سنة واحدة';
  if (p === '3YRS' || p === '3YEARS' || p === '3YR') return '3 سنوات';
  if (p === '4YRS' || p === '4YEARS' || p === '4YR') return '4 سنوات';
  if (p === '5YRS' || p === '5YEARS' || p === '5YR') return '5 سنوات';
  if (p === '6MOS' || p === '6MONTHS') return '6 أشهر';
  if (p.includes('AND')) {
    const m = p.match(/(\d+)YRS?AND(\d+)MOS?/);
    if (m) return `${m[1]} سنوات و ${m[2]} أشهر`;
  }
  return raw;
};

const CVModal = ({ worker, isOpen, onClose, onNext, onPrev, officeWhatsapp }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isZoomed]);

  useEffect(() => {
    setIsZoomed(false);
  }, [worker?.worker_code || worker?.Worker_No]);

  if (!isOpen || !worker) return null;

  const profileImage = 
    worker.full_body_image_url || 
    worker.fullBodyImage || 
    worker.Full_Image || 
    worker.portrait_image_url ||
    worker.portraitImage ||
    worker.Photo;

  const isPortraitFallback = !worker.full_body_image_url && !worker.fullBodyImage && !worker.Full_Image && (worker.portrait_image_url || worker.portraitImage || worker.Photo);

  const skills = getWorkerSkills(worker);
  const languages = getWorkerLanguages(worker);
  const workerPhone = getWorkerPhone(worker);

  const workerWhatsAppUrl = workerPhone ? buildWhatsAppUrl(
    workerPhone, 
    `Hello ${worker.name || worker.Worker_Name || ""}, I am contacting you regarding your Tadbeer profile.`
  ) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 lg:p-4 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white w-full lg:w-[min(95vw,1100px)] h-full lg:h-[90vh] lg:rounded-2xl shadow-none relative flex flex-col no-print overflow-hidden border-[0.5px] border-gray-200">
        
        {/* Navigation Desktop */}
        <button onClick={onPrev} className="absolute top-1/2 -right-16 hidden xl:flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><ChevronRight className="w-8 h-8" /></button>
        <button onClick={onNext} className="absolute top-1/2 -left-16 hidden xl:flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><ChevronLeft className="w-8 h-8" /></button>

        {/* Header */}
        <div className="flex-shrink-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full active:scale-90"><X className="w-6 h-6 text-gray-400" /></button>
            <div>
              <h2 className="font-black text-base text-primary leading-none mb-1">تفاصيل العاملة</h2>
              <p className="text-[10px] font-bold text-gray-400 leading-none">#{worker.worker_code || worker.Worker_No}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 text-primary border border-gray-200 rounded-xl text-xs font-black hover:bg-gray-100 transition-colors">
              <Printer className="w-4 h-4" />
              <span>طباعة PDF</span>
            </button>
            <div className="flex sm:hidden gap-1">
               <button onClick={onPrev} className="p-2 bg-gray-50 rounded-lg active:scale-90"><ChevronRight className="w-5 h-5 text-primary" /></button>
               <button onClick={onNext} className="p-2 bg-gray-50 rounded-lg active:scale-90"><ChevronLeft className="w-5 h-5 text-primary" /></button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto custom-scrollbar bg-gray-50/30">
          <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Image Column */}
              <div className="w-full lg:w-[360px] flex-shrink-0">
                <div className="rounded-2xl overflow-hidden bg-white border-[0.5px] border-gray-200 w-full relative group cursor-zoom-in aspect-[3/4]" onClick={() => setIsZoomed(true)}>
                  {profileImage ? (
                    <>
                      <img src={profileImage} alt="" className={`w-full h-full ${isPortraitFallback ? 'object-cover' : 'object-contain'} transition-transform duration-500 group-hover:scale-105`} />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"><ZoomIn className="w-10 h-10 text-white" /></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><UserIcon className="w-24 h-24" /></div>
                  )}
                </div>
              </div>

              {/* Info Column */}
              <div className="flex-grow space-y-6">
                <div className="bg-white p-6 rounded-2xl border-[0.5px] border-gray-200 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{getFlagEmoji(worker.nationality || worker.Nationality)}</span>
                    <div>
                      <h1 className="text-2xl font-black text-primary uppercase leading-tight">{worker.name || worker.Worker_Name}</h1>
                      <p className="text-accent font-black text-sm">{worker.Job_Title || worker.job_title || 'عاملة منزلية'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                    <StatBox icon={<Calendar className="w-4 h-4" />} label="العمر" value={`${worker.age || worker.Age} سنة`} color="blue" />
                    <StatBox icon={<Globe className="w-4 h-4" />} label="الجنسية" value={worker.nationality || worker.Nationality} color="emerald" />
                    <StatBox icon={<BookOpen className="w-4 h-4" />} label="الديانة" value={worker.religion || worker.Religion} color="purple" />
                    <StatBox icon={<Heart className="w-4 h-4" />} label="الحالة" value={worker.marital_status || worker.Marital_Status} color="pink" />
                    <StatBox icon={<UserIcon className="w-4 h-4" />} label="الأطفال" value={worker.number_of_children || worker.Number_Of_Children} color="orange" />
                    <StatBox icon={<Award className="w-4 h-4" />} label="الخبرة" value={(worker.experience === 'Experienced' || worker.Experience === 'Experienced') ? 'خبيرة' : 'مبتدئة'} color="amber" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard title="المواصفات الجسدية">
                    <div className="space-y-3">
                      <InfoRow icon={<Ruler className="w-3.5 h-3.5" />} label="الطول" value={`${worker.height || worker.Height} سم`} />
                      <InfoRow icon={<Weight className="w-3.5 h-3.5" />} label="الوزن" value={`${worker.weight || worker.Weight} كجم`} />
                      <InfoRow icon={<Activity className="w-3.5 h-3.5" />} label="الصحة" value={worker.health_status || worker.Health_Status} />
                    </div>
                  </DetailCard>
                  
                  <DetailCard title="المهارات واللغات">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-2">المهارات</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.length > 0 ? skills.map(s => <span key={s} className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/5">{s}</span>) : <span className="text-[10px] text-gray-300 italic">لا توجد مهارات</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-2">اللغات</p>
                        <div className="flex flex-wrap gap-1.5">
                          {languages.length > 0 ? languages.map(l => <span key={l} className="px-2 py-1 bg-accent/5 text-accent text-[10px] font-black rounded-lg border border-accent/5">{l}</span>) : <span className="text-[10px] text-gray-300 italic">لا توجد لغات</span>}
                        </div>
                      </div>
                    </div>
                  </DetailCard>
                </div>
              </div>
            </div>

            <section className="bg-white p-6 rounded-2xl border-[0.5px] border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-base font-black text-primary">الخبرة العملية</h3>
              </div>
              {worker.WorkExperience?.length > 0 || worker.work_experience?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(worker.WorkExperience || worker.work_experience).map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border-[0.5px] border-gray-100 rounded-xl">
                      <span className="text-sm font-black text-primary">{exp.country}</span>
                      <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg">{formatPeriod(exp.period)}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="py-8 text-center text-gray-300 text-sm font-bold border-2 border-dashed border-gray-50 rounded-xl">لا توجد خبرة سابقة مسجلة</div>}
            </section>

            <div className="bg-primary rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-[0.5px] border-white/10">
              <div className="text-center md:text-right space-y-2">
                <p className="text-blue-300 font-black uppercase text-[10px] tracking-widest">وكالة التوظيف</p>
                <h3 className="text-xl font-black">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100 text-xs font-bold pt-2">
                  <span className="flex items-center gap-2"><UserIcon className="w-3.5 h-3.5" /> المسؤول: {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}</span>
                  <span className="flex items-center gap-2">📍 {import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <a href={buildOfficeWhatsAppUrl(officeWhatsapp, worker.name || worker.Worker_Name, worker.worker_code || worker.Worker_No)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm transition-all flat-button">تواصل عبر واتساب</a>
                <a href={`tel:${import.meta.env.VITE_OFFICE_PHONE || '0508368230'}`} className="flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-primary hover:bg-gray-100 rounded-xl font-black text-sm transition-all flat-button">اتصال مباشر</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Overlay */}
      {isZoomed && profileImage && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X className="w-8 h-8" /></button>
          <img src={profileImage} alt="" className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value, color }) => {
  const colors = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', purple: 'bg-purple-50 text-purple-600', pink: 'bg-pink-50 text-pink-600', orange: 'bg-orange-50 text-orange-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className={`p-2.5 rounded-xl ${colors[color] || 'bg-gray-50 text-gray-500'}`}>{icon}</div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
        <p className="text-xs font-black text-primary leading-none">{value || '—'}</p>
      </div>
    </div>
  );
};

const DetailCard = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border-[0.5px] border-gray-200 flex flex-col h-full">
    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">{title}</h4>
    <div className="flex-grow">{children}</div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2 text-gray-400 font-bold">{icon}<span className="text-[10px]">{label}:</span></div>
    <span className="text-xs font-black text-primary">{value || '—'}</span>
  </div>
);

const PrintItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">{label}</span>
    <span className="text-xs font-black text-primary">{value || '—'}</span>
  </div>
);

export default CVModal;
