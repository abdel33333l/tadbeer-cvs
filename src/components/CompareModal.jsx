import React from 'react';
import { X, Check, Minus, User as UserIcon } from 'lucide-react';
import { getFlagEmoji } from '../utils/flags';

const CompareModal = ({ workers, isOpen, onClose }) => {
  if (!isOpen || workers.length === 0) return null;

  const fields = [
    { label: 'الجنسية', key: 'Nationality', isFlag: true },
    { label: 'العمر', key: 'Age' },
    { label: 'الديانة', key: 'Religion' },
    { label: 'الحالة الاجتماعية', key: 'Marital_Status' },
    { label: 'عدد الأطفال', key: 'Number_Of_Children' },
    { label: 'الخبرة', key: 'Experience', isExp: true },
    { label: 'المهارات', key: 'Skills', isList: true },
    { label: 'اللغات', key: 'Languages', isList: true },
    { label: 'مدة الضمان', key: 'Agent_Warranty_Period', forceValue: 'سنتين' },
    { label: 'الموقع', key: 'Location', isLoc: true },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 lg:p-6 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-full lg:h-auto lg:max-h-[90vh] lg:rounded-2xl shadow-none overflow-hidden flex flex-col border-[0.5px] border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <h2 className="font-black text-lg text-primary">مقارنة المختارات</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-grow bg-white custom-scrollbar">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="sticky right-0 bg-gray-50 z-20 p-4 text-right border-b border-gray-100 min-w-[120px]">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المواصفات</span>
                </th>
                {workers.map(worker => (
                  <th key={worker.worker_code || worker.Worker_No} className="p-5 border-b border-gray-100 min-w-[200px] z-10">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-[0.5px] border-gray-200">
                        {worker.portrait_image_url || worker.portraitImage || worker.Photo ? (
                          <img 
                            src={worker.portrait_image_url || worker.portraitImage || worker.Photo} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Photo'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <UserIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-primary leading-tight">{worker.name || worker.Worker_Name}</h3>
                        <p className="text-[10px] font-bold text-gray-400">#{worker.worker_code || worker.Worker_No}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr key={field.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                  <td className="sticky right-0 bg-inherit z-20 p-4 text-xs font-black text-gray-500 border-b border-gray-100">
                    {field.label}
                  </td>
                  {workers.map(worker => (
                    <td key={(worker.worker_code || worker.Worker_No) + field.key} className="p-4 text-xs text-center border-b border-gray-100 font-bold text-primary">
                      {renderValue(field, worker)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
           <p className="text-[10px] font-black text-gray-400 flex items-center gap-2">
             <Check className="w-3.5 h-3.5 text-green-500" />
             بحد أقصى 3 عاملات للمقارنة
           </p>
        </div>
      </div>
    </div>
  );
};

const renderValue = (field, worker) => {
  const value = worker[field.key];
  
  if (field.forceValue) return <span className="text-primary">{field.forceValue}</span>;
  if (field.isFlag) return <div className="flex items-center justify-center gap-2"><span className="text-xl">{getFlagEmoji(value)}</span> {value}</div>;
  if (field.isExp) return (value === 'Experienced' || value === 'خبيرة') ? <span className="text-green-600">خبيرة</span> : <span className="text-amber-600">مبتدئة</span>;
  if (field.isLoc) return (value === 'Outside Country' || value === 'خارج الدولة') ? 'خارج الدولة' : 'داخل الدولة';
  if (field.isList) {
    const list = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap justify-center gap-1">
        {list.slice(0, 3).map(item => (
          <span key={item} className="px-1.5 py-0.5 bg-white text-[9px] font-black rounded border border-gray-100">{item}</span>
        ))}
        {list.length > 3 && <span className="text-[8px] text-gray-400">+{list.length - 3}</span>}
      </div>
    );
  }
  
  return <span>{value}{field.suffix || ''}</span>;
};

export default CompareModal;
