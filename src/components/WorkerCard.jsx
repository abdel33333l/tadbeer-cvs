import React from 'react';
import { Heart, MessageCircle, Phone, Calendar, BookOpen, ShieldCheck, MapPin, Info } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const WorkerCard = ({ worker, isShortlisted, onToggleShortlist, onOpenCV }) => {
  const hasExp = worker.Experience === 'Experienced' || worker.experience === 'Experienced';
  const isExperienced = hasExp;
  
  const statusBadge = (worker.status?.includes('متاحة') || !worker.status) ? 
    { label: 'متاحة', bg: '#EAF3DE', text: '#27500A' } : 
    { label: 'خبيرة', bg: '#FAEEDA', text: '#633806' };

  const expBadge = isExperienced ? 
    { label: 'لديها خبرة', bg: '#E6F1FB', text: '#0C447C' } : 
    { label: 'بدون خبرة', bg: '#F1EFE8', text: '#5F5E5A' };

  const cardImage = 
    worker.portrait_image_url || 
    worker.portraitImage || 
    worker.profile_image || 
    worker.headshot_image || 
    worker.Photo;

  const whatsappNum = import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230';
  const officePhone = import.meta.env.VITE_OFFICE_PHONE || '0508368230';

  const expCountries = (worker.work_experience || worker.WorkExperience || []).map(e => e.country).filter(Boolean);

  return (
    <div className="bg-white card-radius flat-border overflow-hidden flex flex-col md:flex-col h-full group relative">
      
      {/* Photo Section: Vertical 3:4 on Desktop, 90px Horizontal on Mobile */}
      <div className="relative flex-shrink-0 flex md:block overflow-hidden h-[120px] md:h-auto md:aspect-[3/4]" onClick={() => onOpenCV(worker)}>
        <div className="w-[90px] md:w-full h-full relative order-last md:order-none">
          {cardImage ? (
            <img 
              src={cardImage} 
              alt="" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover md:rounded-t-[12px] rounded-e-[12px] md:rounded-e-none"
              onError={(e) => { e.target.onerror = null; e.target.parentElement.classList.add('avatar-placeholder'); }}
            />
          ) : (
            <div className="w-full h-full avatar-placeholder md:rounded-t-[12px] rounded-e-[12px] md:rounded-e-none" />
          )}

          {/* Top-Right: Status Badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 pill-radius text-[10px] font-black" style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}>
            {statusBadge.label}
          </div>

          {/* Top-Left: Experience Badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 pill-radius text-[10px] font-black" style={{ backgroundColor: expBadge.bg, color: expBadge.text }}>
            {expBadge.label}
          </div>

          {/* Bottom-Left: Favorite (Circle 26x26) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleShortlist(worker); }}
            className="absolute bottom-2 left-2 w-[26px] h-[26px] bg-white rounded-full flex items-center justify-center border-[0.5px] border-gray-100 active:scale-90 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Card Body Padding 10 12 12 */}
        <div className="flex-grow p-[10px_12px_12px] flex flex-col justify-between md:order-last">
          <div className="space-y-1.5">
            <h3 className="text-[13px] font-medium text-primary truncate leading-tight uppercase" title={worker.name || worker.Worker_Name}>
              {worker.name || worker.Worker_Name}
            </h3>
            
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
              <span>{getFlagEmoji(worker.nationality || worker.Nationality)}</span>
              <span>{worker.nationality || worker.Nationality}</span>
              <span>•</span>
              <span className="font-mono">#{worker.worker_code || worker.Worker_No}</span>
            </div>

            {/* Guarantee Badge */}
            <div className="bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 pill-radius flex items-center gap-1 w-fit">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[10px] font-black">ضمان سنتين</span>
            </div>

            {/* Meta Row */}
            <div className="flex gap-2.5 text-[12px] text-gray-400 font-bold">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{worker.age || worker.Age} سنة</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{worker.religion || worker.Religion}</span>
              </div>
            </div>

            {/* Experience Note */}
            {isExperienced ? (
               <div className="flex items-center gap-1 text-[11px] text-[#185FA5] font-bold">
                 <MapPin className="w-3 h-3" />
                 <span>خبرة في: {expCountries.length > 0 ? expCountries.join('، ') : 'دول الخليج'}</span>
               </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-[#854F0B] bg-[#FAEEDA] px-2 py-1 element-radius font-bold">
                <Info className="w-3 h-3" />
                <span>عاملة جديدة — بدون خبرة سابقة</span>
              </div>
            )}

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {(worker.skills || worker.Skills || []).slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-50 border-[0.5px] border-gray-200 text-gray-500 text-[10px] pill-radius font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Actions Row (Targets 44x44) */}
          <div className="flex gap-1.5 mt-3">
             <button 
              onClick={() => onOpenCV(worker)}
              className="flex-grow h-[44px] bg-primary text-white element-radius font-medium text-[11px] active:opacity-90"
             >
               عرض الملف الكامل
             </button>
             <a 
              href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer"
              className="w-[44px] h-[44px] flex items-center justify-center bg-[#e8f8ef] text-[#128C7E] border-[0.5px] border-[#25D366] element-radius active:scale-95 transition-transform"
             >
               <MessageCircle className="w-5 h-5" />
             </a>
             <a 
              href={`tel:${officePhone}`}
              className="w-[44px] h-[44px] flex items-center justify-center bg-blue-50 text-blue-600 border-[0.5px] border-blue-200 element-radius active:scale-95 transition-transform"
             >
               <Phone className="w-5 h-5" />
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
