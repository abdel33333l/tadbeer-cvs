import React from 'react';
import { X, Check, Minus, User } from 'lucide-react';
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 lg:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-full lg:h-auto lg:max-h-[90vh] lg:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <h2 className="font-black text-xl text-primary">مقارنة العاملات المختارة</h2>
          <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all active:scale-90">
            <X className="w-7 h-7 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-grow bg-surface/30 custom-scrollbar">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-white">
                <th className="sticky right-0 bg-white z-20 p-4 text-right border-b-2 border-gray-100 min-w-[120px] shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">المواصفات</span>
                </th>
                {workers.map(worker => (
                  <th key={worker.Worker_No} className="p-6 border-b-2 border-gray-100 min-w-[240px] z-10">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 border-4 border-white shadow-xl rotate-3">
                        {worker.portraitImage || worker.Photo ? (
                          <img 
                            src={worker.portraitImage || worker.Photo} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Photo'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                            <User className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-primary leading-tight">{worker.Worker_Name}</h3>
                        <p className="text-sm font-bold text-accent">{worker.Worker_No}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr key={field.key} className={idx % 2 === 0 ? 'bg-white/50' : 'bg-white'}>
                  <td className="sticky right-0 bg-white z-20 p-5 text-sm font-black text-gray-500 border-b border-gray-100 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                    {field.label}
                  </td>
                  {workers.map(worker => (
                    <td key={worker.Worker_No + field.key} className="p-5 text-base text-center border-b border-gray-50 font-bold text-primary">
                      {renderValue(field, worker)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-center">
           <p className="text-xs font-black text-gray-400 flex items-center gap-2">
             <Check className="w-4 h-4 text-green-500" />
             يمكنك اختيار حتى 3 عاملات للمقارنة في نفس الوقت
           </p>
        </div>
      </div>
    </div>
  );
};

const renderValue = (field, worker) => {
  const value = worker[field.key];
  
  if (field.forceValue) return <span className="text-primary">{field.forceValue}</span>;
  if (field.isFlag) return <div className="flex items-center justify-center gap-2"><span className="text-3xl filter drop-shadow-sm">{getFlagEmoji(value)}</span> {value}</div>;
  if (field.isExp) return value === 'Experienced' ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">خبيرة</span> : <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg">مبتدئة</span>;
  if (field.isLoc) return value === 'Outside Country' ? 'خارج الدولة' : 'داخل الدولة';
  if (field.isList) return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {value.map(item => (
        <span key={item} className="px-2.5 py-1 bg-surface text-xs font-black rounded-lg border border-gray-100">{item}</span>
      ))}
    </div>
  );
  
  return <span>{value}{field.suffix || ''}</span>;
};

export default CompareModal;
