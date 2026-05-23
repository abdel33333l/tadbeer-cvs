import React from 'react';
import { Heart, User as UserIcon, MapPin, Calendar, BookOpen, ShieldCheck, MessageCircle } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const WorkerCard = ({ worker, isShortlisted, onToggleShortlist, onOpenCV }) => {
  const experienceLabel = worker.Experience === 'Experienced' ? 'خبيرة' : 'مبتدئة';
  const experienceColor = worker.Experience === 'Experienced' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

  // Specific image logic for the card - prioritize Supabase public URLs
  const cardImage = 
    worker.portrait_image_url || 
    worker.portraitImage || 
    worker.profile_image || 
    worker.headshot_image || 
    worker.Photo || 
    worker.full_body_image_url ||
    worker.fullBodyImage ||
    worker.Full_Image;

  const isFullBodyFallback = !worker.portrait_image_url && !worker.portraitImage && 
                             !worker.profile_image && !worker.headshot_image && !worker.Photo &&
                             (worker.full_body_image_url || worker.fullBodyImage || worker.Full_Image);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Photo Section */}
      <div className="relative aspect-[4/5] bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onOpenCV(worker)}>
        {cardImage ? (
          <img 
            src={cardImage} 
            alt={worker.Worker_Name} 
            loading="lazy"
            decoding="async"
            className={`w-full h-full ${isFullBodyFallback ? 'object-contain' : 'object-cover'} object-center transition-transform duration-500 hover:scale-105`}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x500?text=No+Photo'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <UserIcon className="w-20 h-20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-black shadow-md ${experienceColor}`}>
            {experienceLabel}
          </div>
          <div className="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            ضمان سنتين
          </div>
        </div>

        {/* Shortlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleShortlist(worker); }}
          className="absolute top-3 left-3 p-3 rounded-full bg-white/90 hover:bg-white shadow-md transition-all active:scale-95 group"
          aria-label="Add to shortlist"
        >
          <Heart className={`w-6 h-6 transition-colors ${isShortlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'}`} />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0">
            <h3 className="text-xl font-black text-primary truncate leading-tight mb-1" title={worker.Worker_Name}>
              {worker.Worker_Name}
            </h3>
            <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              {worker.Worker_No}
            </span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-3xl filter drop-shadow-sm">{getFlagEmoji(worker.Nationality)}</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mt-0.5">{worker.Nationality}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 rounded-lg text-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold leading-none mb-0.5">العمر</p>
              <p className="text-sm font-black text-primary leading-none">{worker.Age} سنة</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold leading-none mb-0.5">الديانة</p>
              <p className="text-sm font-black text-primary leading-none">{worker.Religion}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
          {worker.Skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2.5 py-1 bg-surface text-primary text-xs font-bold rounded-lg border border-gray-100">
              {skill}
            </span>
          ))}
          {worker.Skills.length > 3 && (
            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-lg border border-gray-100">
              +{worker.Skills.length - 3} أخرى
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onOpenCV(worker)}
            className="flex-grow py-4 bg-primary text-white rounded-xl font-black hover:bg-opacity-90 active:scale-[0.98] transition-all text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            الملف الكامل
          </button>
          <a 
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230'}?text=${encodeURIComponent(`مرحباً عادل، أنا مهتم بالعاملة ${worker.Worker_Name} (${worker.Worker_No})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center"
            title={`تواصل مع ${import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}`}
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
