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

  // Reset zoom when changing workers
  useEffect(() => {
    setIsZoomed(false);
  }, [worker?.Worker_No]);

  if (!isOpen || !worker) return null;

  const profileImage = 
    worker.full_body_image_url || 
    worker.fullBodyImage || 
    worker.Full_Image || 
    worker.portrait_image_url ||
    worker.portraitImage ||
    worker.Photo;

  const isPortraitFallback = !worker.full_body_image_url && !worker.fullBodyImage && !worker.Full_Image && (worker.portrait_image_url || worker.portraitImage || worker.Photo);

  // Use UI helpers with exhaustive fallbacks
  const skills = getWorkerSkills(worker);
  const languages = getWorkerLanguages(worker);
  const workerPhone = getWorkerPhone(worker);

  const workerWhatsAppUrl = workerPhone ? buildWhatsAppUrl(
    workerPhone, 
    `Hello ${worker.Worker_Name || ""}, I am contacting you regarding your Tadbeer profile.`
  ) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 lg:p-4 backdrop-blur-sm">
      <div className="bg-white w-full lg:w-[min(95vw,1100px)] h-full lg:h-[90vh] lg:rounded-3xl shadow-2xl relative flex flex-col no-print overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Navigation Buttons Desktop */}
        <button onClick={onPrev} className="absolute top-1/2 -right-16 hidden xl:flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all">
          <ChevronRight className="w-8 h-8" />
        </button>
        <button onClick={onNext} className="absolute top-1/2 -left-16 hidden xl:flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all">
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Header */}
        <div className="flex-shrink-0 bg-white p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between no-print z-10 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
              <X className="w-7 h-7 text-gray-500" />
            </button>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-primary leading-none mb-1">ملف العاملة</h2>
              <p className="text-xs font-bold text-gray-400 leading-none">{worker.Worker_No}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface text-primary border border-gray-200 rounded-xl text-sm font-black hover:bg-gray-100 transition-colors active:scale-95"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة / PDF</span>
            </button>
            <div className="flex sm:hidden gap-1">
               <button onClick={onPrev} className="p-2 bg-gray-50 rounded-lg active:scale-90"><ChevronRight className="w-6 h-6 text-primary" /></button>
               <button onClick={onNext} className="p-2 bg-gray-50 rounded-lg active:scale-90"><ChevronLeft className="w-6 h-6 text-primary" /></button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-0 sm:p-6 md:p-8 custom-scrollbar bg-surface/30">
          
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-0">
            
            {/* Top Section: Name & Status */}
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              
              {/* Image Column */}
              <div className="w-full md:w-[380px] flex-shrink-0">
                <div 
                  className="rounded-2xl overflow-hidden bg-white shadow-xl border-4 border-white w-full flex items-center justify-center relative group cursor-zoom-in aspect-[3/4] md:aspect-auto"
                  onClick={() => setIsZoomed(true)}
                >
                  {profileImage ? (
                    <>
                      <img 
                        src={profileImage} 
                        alt={worker.Worker_Name} 
                        className={`w-full ${isPortraitFallback ? 'h-full object-cover' : 'h-auto object-contain'} max-h-[60vh] md:max-h-[70vh] block transition-transform duration-500 group-hover:scale-105`}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x600?text=No+Photo'; }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center bg-gray-100 text-gray-300">
                      <UserIcon className="w-32 h-32" />
                    </div>
                  )}
                  
                  {/* Floating ID Tag */}
                  <div className="absolute bottom-4 right-4 bg-primary/90 text-white px-4 py-2 rounded-xl text-lg font-black shadow-lg backdrop-blur-md border border-white/20">
                    {worker.Worker_No}
                  </div>
                </div>
              </div>

              {/* Main Info Column */}
              <div className="flex-grow space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl filter drop-shadow-sm">{getFlagEmoji(worker.Nationality)}</span>
                      <h1 className="text-3xl sm:text-4xl font-black text-primary leading-tight uppercase">
                        {worker.Worker_Name}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-black text-accent bg-accent/10 px-4 py-1.5 rounded-xl">
                        {worker.Job_Title}
                      </span>
                      <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl text-sm font-black flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        متاحة الآن
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                    <StatBox icon={<Calendar className="w-5 h-5" />} label="العمر" value={`${worker.Age} سنة`} color="blue" />
                    <StatBox icon={<Globe className="w-5 h-5" />} label="الجنسية" value={worker.Nationality} color="emerald" />
                    <StatBox icon={<BookOpen className="w-5 h-5" />} label="الديانة" value={worker.Religion} color="purple" />
                    <StatBox icon={<Heart className="w-5 h-5" />} label="الحالة" value={worker.Marital_Status} color="pink" />
                    <StatBox icon={<UserIcon className="w-5 h-5" />} label="الأطفال" value={worker.Number_Of_Children} color="orange" />
                    <StatBox icon={<Award className="w-5 h-5" />} label="الخبرة" value={worker.Experience === 'Experienced' ? 'خبيرة' : 'مبتدئة'} color="amber" />
                  </div>
                </div>

                {/* Primary Actions Mobile Only */}
                <div className="grid grid-cols-1 gap-3 sm:hidden">
                  <a 
                    href={buildOfficeWhatsAppUrl(officeWhatsapp, worker.Worker_Name, worker.Worker_No)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-5 bg-green-600 text-white rounded-2xl text-lg font-black hover:bg-green-700 shadow-xl shadow-green-600/20 active:scale-[0.98] transition-all"
                  >
                    <MessageCircle className="w-6 h-6" />
                    أرسل الملف للمكتب
                  </a>

                  {workerPhone && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                       <a 
                        href={workerWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-1 py-4 bg-green-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-black">واتساب للعاملة</span>
                      </a>
                      <a 
                        href={`tel:${workerPhone}`}
                        className="flex flex-col items-center justify-center gap-1 py-4 bg-primary text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                      >
                        <Phone className="w-5 h-5" />
                        <span className="text-xs font-black">اتصال بالعاملة</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard title="المواصفات الجسدية">
                    <div className="space-y-4">
                      <InfoRow icon={<Ruler className="w-4 h-4" />} label="الطول" value={`${worker.Height} سم`} />
                      <InfoRow icon={<Weight className="w-4 h-4" />} label="الوزن" value={`${worker.Weight} كجم`} />
                      <InfoRow icon={<Activity className="w-4 h-4" />} label="الحالة الصحية" value={worker.Health_Status} />
                    </div>
                  </DetailCard>
                  
                  <DetailCard title="المهارات واللغات">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">المهارات</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.length > 0 ? (
                            skills.map(skill => (
                              <span key={skill} className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-black rounded-lg border border-primary/10">{skill}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">لا توجد مهارات مسجلة</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">اللغات</p>
                        <div className="flex flex-wrap gap-2">
                          {languages.length > 0 ? (
                            languages.map(lang => (
                              <span key={lang} className="px-3 py-1.5 bg-accent/5 text-accent text-xs font-black rounded-lg border border-accent/10">{lang}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">لا توجد لغات مسجلة</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </DetailCard>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-black text-primary">الخبرة العملية السابقة</h3>
              </div>
              
              {worker.WorkExperience && worker.WorkExperience.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {worker.WorkExperience.map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-gray-100">
                      <span className="text-lg font-black text-primary">{exp.country}</span>
                      <span className="px-4 py-1.5 bg-primary text-white text-sm font-black rounded-xl">
                        {formatPeriod(exp.period)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-bold">لا توجد بيانات خبرة سابقة مسجلة</p>
                </div>
              )}
            </section>

            {/* Footer Agency Card */}
            <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-right space-y-2">
                  <p className="text-blue-200 font-black uppercase tracking-widest text-sm">وكالة التوظيف المعتمدة</p>
                  <h3 className="text-2xl sm:text-3xl font-black">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h3>
                  <div className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-blue-100 text-sm font-bold pt-2">
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><UserIcon className="w-4 h-4 text-blue-300" /> المسؤول: {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-300" /> {import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31'}</span>
                    <span dir="ltr" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 text-blue-300" /> {import.meta.env.VITE_OFFICE_PHONE || '0508368230'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <a 
                    href={buildOfficeWhatsAppUrl(officeWhatsapp, worker.Worker_Name, worker.Worker_No)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                  >
                    <MessageCircle className="w-6 h-6" />
                    تواصل مع {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'} عبر واتساب
                  </a>
                  <a 
                    href={`tel:${(import.meta.env.VITE_OFFICE_PHONE || '0508368230').replace(/[^\d+]/g, '')}`}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary hover:bg-gray-100 rounded-2xl font-black transition-all shadow-lg active:scale-95"
                  >
                    <Phone className="w-6 h-6 text-primary" />
                    اتصال مباشر بالمكتب
                  </a>
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            </div>

          </div>

          <div className="h-20 lg:h-12" />
        </div>
      </div>

      {/* Print View (A4 Optimized) */}
      <div className="hidden print-only print-area bg-white p-6 w-full h-[297mm] flex-col text-gray-800 text-sm">
        {/* Header: Company & Title */}
        <div className="flex justify-between items-center border-b-2 border-primary pb-3 mb-4">
          <div>
            <h1 className="text-2xl font-black text-primary uppercase leading-tight">{worker.Worker_Name}</h1>
            <p className="text-accent font-bold text-base mt-1">{worker.Job_Title} — {worker.Worker_No}</p>
          </div>
          <div className="text-left" dir="ltr">
            <h2 className="font-black text-lg text-primary text-right mb-1">{import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}</h2>
            <div className="text-sm font-bold text-gray-600 flex flex-col items-end gap-0.5">
              <span>👤 {import.meta.env.VITE_OFFICE_MANAGER || 'عادل'} | 📍 {import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31'}</span>
              <span>📱 {import.meta.env.VITE_WHATSAPP_NUMBER || '+971508368230'}</span>
            </div>
          </div>
        </div>

        {/* Main Body: Details & Photo */}
        <div className="grid grid-cols-[1fr_200px] gap-6 mb-4">
          {/* Left: Details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PrintItem label="الجنسية" value={`${getFlagEmoji(worker.Nationality)} ${worker.Nationality}`} />
            <PrintItem label="الديانة" value={worker.Religion} />
            <PrintItem label="العمر" value={worker.Age} />
            <PrintItem label="تاريخ الميلاد" value={worker.Date_Of_Birth} />
            <PrintItem label="الحالة الاجتماعية" value={worker.Marital_Status} />
            <PrintItem label="عدد الأطفال" value={worker.Number_Of_Children} />
            <PrintItem label="الطول / الوزن" value={`${worker.Height}cm / ${worker.Weight}kg`} />
            <PrintItem label="الحالة الصحية" value={worker.Health_Status} />
            <PrintItem label="الخبرة" value={worker.Experience === 'Experienced' ? 'خبيرة' : 'مبتدئة'} />
            <PrintItem label="المؤهل العلمي" value={worker.Qualification} />
          </div>

          {/* Right: Photo */}
          <div className="w-[200px] h-[260px] border-2 border-primary rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
            {profileImage ? (
              <img src={profileImage} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                <UserIcon className="w-20 h-20" />
              </div>
            )}
          </div>
        </div>

        {/* Skills & Languages */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold border-b border-gray-200 pb-1 mb-2 text-primary">المهارات</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {skills.length > 0 ? skills.join('، ') : 'لا توجد بيانات'}
              </p>
            </div>
            <div>
              <h4 className="font-bold border-b border-gray-200 pb-1 mb-2 text-primary">اللغات</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {languages.length > 0 ? languages.join('، ') : 'لا توجد بيانات'}
              </p>
            </div>
          </div>
        </div>

        {/* Experience Table */}
        {worker.WorkExperience && worker.WorkExperience.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold border-b border-gray-200 pb-1 mb-2 text-primary">الخبرة السابقة</h4>
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-surface text-primary">
                <tr>
                  <th className="p-1.5 border border-gray-200 text-right">الدولة</th>
                  <th className="p-1.5 border border-gray-200 text-center w-1/3">المدة</th>
                </tr>
              </thead>
              <tbody>
                {worker.WorkExperience.map((exp, idx) => (
                  <tr key={idx}>
                    <td className="p-1.5 border border-gray-200">{exp.country}</td>
                    <td className="p-1.5 border border-gray-200 text-center font-bold">{formatPeriod(exp.period)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Passport & Contract (Pushed to bottom) */}
        <div className="grid grid-cols-2 gap-6 mt-auto border-t-2 border-primary pt-4">
          <div>
            <h4 className="font-bold text-primary mb-2 text-sm">جواز السفر</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              <PrintItem label="رقم الجواز" value={worker.Passport_Number} />
              <PrintItem label="مكان الإصدار" value={worker.Passport_Place_Of_Issue} />
              <PrintItem label="تاريخ الانتهاء" value={worker.Passport_Expiry_Date} />
              <PrintItem label="الموقع" value={worker.Location === 'Outside Country' ? 'خارج الدولة' : 'داخل الدولة'} />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-2 text-sm">التفاصيل الإضافية</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              <PrintItem label="الباقة" value={worker.Package} />
              <PrintItem label="مدة الضمان" value="سنتين" />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Overlay */}
      {isZoomed && profileImage && (
        <div 
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out backdrop-blur-md"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[120]"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
          >
            <X className="w-10 h-10" />
          </button>
          <img 
            src={profileImage} 
            alt={worker.Worker_Name} 
            className="max-w-full max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className={`p-3 rounded-2xl ${colors[color] || 'bg-gray-50 text-gray-500'}`}>
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
        <p className="text-sm font-black text-primary leading-none">{value || '—'}</p>
      </div>
    </div>
  );
};

const DetailCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">{title}</h4>
    <div className="flex-grow">{children}</div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2 text-gray-400 font-bold">
      {icon}
      <span className="text-xs">{label}:</span>
    </div>
    <span className="text-sm font-black text-primary">{value || '—'}</span>
  </div>
);

const PrintItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-none mb-1">{label}</span>
    <span className="text-sm font-black text-primary leading-tight">{value || '—'}</span>
  </div>
);

export default CVModal;
