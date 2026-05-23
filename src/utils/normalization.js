// Helper to check if a value means "YES"
const isYes = (val) => {
  if (val === true || val === 1 || val === "1") return true;
  if (typeof val === 'string') {
    const v = val.toUpperCase().trim();
    return v === 'YES' || v === 'TRUE' || v === 'Y' || v === 'OK' || v === 'SELECTED' || v === '1';
  }
  return false;
};

// Helper to normalize skills from diverse formats
export const getNormalizedSkills = (worker) => {
  if (!worker) return [];
  
  // Possible containers for skills
  const containerKeys = [
    'skills', 'Skills', 'skill', 'Skill', 'SKILLS',
    'Skills SubForm', 'Skills_SubForm', 'SkillsSubForm', 'skills_subform', 'Skills_SubForm.English',
    'Skills Table', 'Skills_Table'
  ];

  let result = [];

  // 1. Check container fields
  for (const key of containerKeys) {
    const val = worker[key] || worker.raw_data?.[key];
    if (!val) continue;

    // Handle Comma String
    if (typeof val === 'string') {
      result.push(...val.split(',').map(s => s.trim()));
    }
    // Handle Array
    else if (Array.isArray(val)) {
      val.forEach(item => {
        if (typeof item === 'string') result.push(item.trim());
        else if (typeof item === 'object' && item !== null) {
          // [{ English: "Cooking", Result: "YES" }]
          if (isYes(item.Result || item.result || item.Value || item.Selected || item.status)) {
            result.push(item.English || item.Name || item.skill || item.label || item.Title || Object.values(item)[0]);
          }
        }
      });
    }
    // Handle Object { Cooking: "YES" }
    else if (typeof val === 'object') {
      Object.entries(val).forEach(([k, v]) => {
        if (isYes(v)) result.push(k.replace(/_/g, ' '));
      });
    }
  }

  // 2. Check individual YES/NO fields (English & Arabic)
  const individualFields = {
    'Cleaning': ['Cleaning', 'cleaning', 'CLEANING', 'التنظيف', 'تنظيف'],
    'Cooking': ['Cooking', 'cooking', 'COOKING', 'الطبخ', 'طبخ'],
    'Ironing': ['Ironing', 'ironing', 'IRONING', 'الكوي', 'كوي'],
    'Baby Sitting': ['Baby Sitting', 'baby_sitting', 'Babysitting', 'BABY SITTING', 'العناية بالأطفال', 'تربية أطفال'],
    'Elderly Care': ['Caring For The Elderly', 'Elderly Care', 'elderly_care', 'رعاية كبار السن', 'كبار السن'],
    'Washing': ['Washing', 'washing', 'الغسيل', 'غسيل'],
    'Sewing': ['Sewing', 'sewing', 'الخياطة', 'خياطة'],
    'Driving': ['Driving', 'driving', 'القيادة', 'سواقة']
  };

  Object.entries(individualFields).forEach(([label, keys]) => {
    for (const key of keys) {
      if (isYes(worker[key]) || isYes(worker.raw_data?.[key])) {
        result.push(label);
        break;
      }
    }
  });

  // Clean, remove duplicates, and filter out noise
  const noise = ['ID', 'WORKER_ID', 'CREATED_AT', 'UPDATED_AT', 'WORKER NO', 'PASSPORT'];
  return [...new Set(result.filter(s => 
    s && 
    typeof s === 'string' && 
    s.length > 1 && 
    !noise.includes(s.toUpperCase())
  ))];
};

// Helper to normalize languages from diverse formats
export const getNormalizedLanguages = (worker) => {
  if (!worker) return [];

  const containerKeys = [
    'languages', 'Languages', 'language', 'Language', 'LANGUAGES',
    'Knowledge Of Language', 'Knowledge of Language', 'knowledge_of_language',
    'Language SubForm', 'Language_SubForm', 'Language_SubForm.English'
  ];

  let result = [];

  // 1. Check container fields
  for (const key of containerKeys) {
    const val = worker[key] || worker.raw_data?.[key];
    if (!val) continue;

    if (typeof val === 'string') {
      result.push(...val.split(',').map(l => l.trim()));
    }
    else if (Array.isArray(val)) {
      val.forEach(item => {
        if (typeof item === 'string') result.push(item.trim());
        else if (typeof item === 'object' && item !== null) {
          const name = item.English || item.language || item.name || item.Arabic || item.Label || Object.values(item)[0];
          const rate = item.Rate || item.rate || item.Level || item.level || item.Percentage || item.proficiency;
          
          if (name && (rate === undefined || isYes(rate) || (typeof rate === 'number' && rate > 0) || (typeof rate === 'string' && !rate.toUpperCase().includes('NO')))) {
            result.push(rate && typeof rate !== 'boolean' && !isYes(rate) ? `${name} (${rate}${typeof rate === 'number' ? '%' : ''})` : name);
          }
        }
      });
    }
    else if (typeof val === 'object') {
      Object.entries(val).forEach(([k, v]) => {
        if (v && v !== 'NO' && v !== 'No' && v !== '0') {
          result.push(typeof v === 'string' && !isYes(v) ? `${k} (${v})` : k);
        }
      });
    }
  }

  // 2. Check individual fields
  const individualLangs = {
    'English': ['English', 'english', 'ENGLISH', 'الإنجليزية', 'انجليزي'],
    'Arabic': ['Arabic', 'arabic', 'ARABIC', 'العربية', 'عربي'],
    'French': ['French', 'french', 'الفرنسية'],
    'Hindi': ['Hindi', 'hindi', 'الهندية']
  };

  Object.entries(individualLangs).forEach(([label, keys]) => {
    for (const key of keys) {
      const val = worker[key] || worker.raw_data?.[key];
      if (val && (isYes(val) || (typeof val === 'string' && val.length > 2 && !val.toUpperCase().includes('NO')))) {
        result.push(label);
        break;
      }
    }
  });

  return [...new Set(result.filter(Boolean))];
};

/**
 * UI Helper: Get skills for a worker with fallbacks
 */
export const getWorkerSkills = (worker) => {
  if (!worker) return [];
  
  // 1. If we have normalized skills already
  if (Array.isArray(worker.skills) && worker.skills.length > 0) return worker.skills;
  if (Array.isArray(worker.Skills) && worker.Skills.length > 0) return worker.Skills;
  
  // 2. Otherwise re-normalize from scratch (handles raw_data and direct fields)
  return getNormalizedSkills(worker);
};

/**
 * UI Helper: Get languages for a worker with fallbacks
 */
export const getWorkerLanguages = (worker) => {
  if (!worker) return [];
  
  if (Array.isArray(worker.languages) && worker.languages.length > 0) return worker.languages;
  if (Array.isArray(worker.Languages) && worker.Languages.length > 0) return worker.Languages;
  
  return getNormalizedLanguages(worker);
};

// Helper to normalize phone numbers
export const normalizePhoneNumber = (phone) => {
  if (!phone) return "";

  let cleaned = String(phone)
    .replace(/[^\d+]/g, "")
    .trim();

  // If number starts with 00, convert to +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }

  // If UAE local number starts with 05, convert to +9715
  if (cleaned.startsWith("05")) {
    cleaned = "+971" + cleaned.slice(1);
  }

  // If number starts with 5 and has 9 digits, assume UAE mobile
  if (/^5\d{8}$/.test(cleaned)) {
    cleaned = "+971" + cleaned;
  }

  return cleaned;
};

// Helper to extract worker phone from diverse sources
export const getWorkerPhone = (worker) => {
  if (!worker) return "";
  
  const rawPhone =
    worker.phone ||
    worker.mobile ||
    worker.mobile_no ||
    worker.phone_number ||
    worker.tel ||
    worker.telephone ||
    worker.contact_number ||
    worker.worker_phone ||
    worker.raw_data?.phone ||
    worker.raw_data?.mobile ||
    worker.raw_data?.["Mobile No"] ||
    worker.raw_data?.["Tel\\Mobile No."] ||
    worker.raw_data?.["Tel/Mobile No."] ||
    worker.raw_data?.["Phone"] ||
    worker.raw_data?.["Contact Number"];

  return normalizePhoneNumber(rawPhone);
};
