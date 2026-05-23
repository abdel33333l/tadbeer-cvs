import React from 'react';
import { Heart, Search } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const WorkerRow = ({ worker, isShortlisted, onToggleShortlist, onOpenCV }) => {
  const experienceLabel = worker.Experience === 'Experienced' ? 'خبيرة' : 'مبتدئة';
  const experienceColor = worker.Experience === 'Experienced' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

  const cardImage = 
    worker.portraitImage || 
    worker.profile_image || 
    worker.headshot_image || 
    worker.Photo || // Fallback to legacy field
    worker.fullBodyImage ||
    worker.Full_Image; // Last resort legacy field

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex items-center p-3 gap-4 hover:shadow-md transition-shadow">
      {/* Photo */}
      <div 
        className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden cursor-pointer" 
        onClick={() => onOpenCV(worker)}
      >
        {cardImage ? (
          <img 
            src={cardImage} 
            alt={worker.Worker_Name} 
            className="w-full h-full object-contain object-center"
            onError={(e) => { e.target.onerror = null; e.target.classList.add('avatar-placeholder'); e.target.src = ''; }}
          />
        ) : (
          <div className="w-full h-full avatar-placeholder" />
        )}
      </div>

      {/* Basic Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-primary truncate">
            {worker.Worker_Name}
          </h3>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex-shrink-0">
            {worker.Worker_No}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{getFlagEmoji(worker.Nationality)}</span>
          <span className="text-xs font-medium text-gray-700">{worker.Nationality}</span>
          <span className="text-[10px] text-gray-400">|</span>
          <span className="text-xs text-gray-500">{worker.Age} سنة</span>
          <span className="text-[10px] text-gray-400">|</span>
          <span className="text-xs text-gray-500">{worker.Religion}</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {worker.Skills.slice(0, 4).map((skill, index) => (
            <span key={index} className="px-2 py-0.5 bg-surface text-primary text-[10px] rounded border border-gray-100">
              {skill}
            </span>
          ))}
          {worker.Skills.length > 4 && (
            <span className="text-[10px] text-gray-400 pr-1">+{worker.Skills.length - 4}</span>
          )}
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
        <div className="flex gap-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${experienceColor}`}>
            {experienceLabel}
          </span>
          <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold">
            ضمان سنتين
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onToggleShortlist(worker)}
            className="p-2 rounded border border-gray-200 hover:bg-gray-50"
          >
            <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
          </button>
          <button 
            onClick={() => onOpenCV(worker)}
            className="p-2 rounded bg-primary text-white hover:bg-opacity-90 transition-all"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerRow;
