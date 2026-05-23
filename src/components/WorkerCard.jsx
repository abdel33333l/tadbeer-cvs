import React from 'react';
import { Heart, MessageCircle, Phone, Calendar, BookOpen, ShieldCheck } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const WorkerCard = ({ worker, isShortlisted, onToggleShortlist, onOpenCV }) => {
  const isExperienced = worker.Experience === 'Experienced' || worker.experience === 'Experienced';
  const badgeText = isExperienced ? 'خبيرة' : 'متاحة';
  const badgeColor = isExperienced ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';

  const cardImage = 
    worker.portrait_image_url || 
    worker.portraitImage || 
    worker.profile_image || 
    worker.headshot_image || 
    worker.Photo;

  const manager = import.meta.env.VITE_OFFICE_MANAGER || 'عادل';
  const whatsappNum = import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230';
  const officePhone = import.meta.env.VITE_OFFICE_PHONE || '0508368230';

  return (
    <div className="mobile-card p-4 space-y-4">
      {/* Horizontal Info Row */}
      <div className="flex gap-4 items-start" onClick={() => onOpenCV(worker)}>
        {/* Info Column (Left) */}
        <div className="flex-grow min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-primary truncate leading-tight uppercase">
              {worker.name || worker.Worker_Name}
            </h3>
            <span className="text-lg flex-shrink-0">{getFlagEmoji(worker.nationality || worker.Nationality)}</span>
          </div>
          
          <p className="text-[10px] font-bold text-gray-400 leading-none">#{worker.worker_code || worker.Worker_No}</p>

          <div className="flex items-center gap-1.5 py-1">
             <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${badgeColor}`}>
              {badgeText}
            </div>
            <div className="bg-trust-bg text-trust-text px-2 py-0.5 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="text-[9px] font-black">ضمان سنتين</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">{worker.age || worker.Age} سنة</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">{worker.religion || worker.Religion}</span>
            </div>
          </div>

          {/* Skills Chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            {(worker.Skills || worker.skills || []).slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded-full border border-gray-100">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Image Column (Right) */}
        <div className="relative w-[80px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border-[0.5px] border-gray-100">
          {cardImage ? (
            <img 
              src={cardImage} 
              alt="" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.parentElement.classList.add('avatar-placeholder'); }}
            />
          ) : (
            <div className="w-full h-full avatar-placeholder" />
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleShortlist(worker); }}
            className="absolute top-1 right-1 tap-target"
          >
            <Heart className={`w-5 h-5 drop-shadow-sm ${isShortlisted ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-2">
        <button 
          onClick={() => onOpenCV(worker)}
          className="flex-grow py-3 bg-primary text-white rounded-xl font-black text-xs tap-target active:opacity-90 transition-opacity"
        >
          عرض الملف الكامل
        </button>
        
        <a 
          href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`مرحباً ${manager}، أنا مهتم بالعاملة ${worker.name || worker.Worker_Name} (${worker.worker_code || worker.Worker_No})`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white rounded-xl tap-target active:opacity-90 transition-opacity px-4 flex items-center justify-center border-[0.5px] border-green-600"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
        <a 
          href={`tel:${officePhone}`}
          className="bg-blue-500 text-white rounded-xl tap-target active:opacity-90 transition-opacity px-4 flex items-center justify-center border-[0.5px] border-blue-600"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default WorkerCard;
