// Helper to check if a value means "YES"
const isYes = (val) => {
  if (val === true || val === 1) return true;
  if (typeof val === 'string') {
    const v = val.toUpperCase().trim();
    return v === 'YES' || v === 'TRUE' || v === 'Y' || v === 'OK' || v === 'SELECTED';
  }
  return false;
};

// Helper to normalize skills from diverse formats
export const getNormalizedSkills = (worker) => {
  if (!worker) return [];
  
  // Try all possible sources in order
  const sources = [
    worker.skills,
    worker.raw_data?.skills,
    worker.raw_data?.Skills,
    worker.raw_data?.skill,
    worker.raw_data?.["Skills"],
    worker.raw_data?.["Skills SubForm"],
    worker.raw_data?.["Skills_SubForm"],
    worker.raw_data?.["skills_subform"],
    worker["Skills SubForm"],
    worker["Skills"]
  ];

  let rawSkills = sources.find(s => s !== undefined && s !== null) || [];
  let result = [];

  // 1. Handle Comma String
  if (typeof rawSkills === 'string') {
    result = rawSkills.split(',').map(s => s.trim());
  }
  // 2. Handle Array of Objects (e.g. [{ English: "Cooking", Result: "YES" }])
  else if (Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object') {
    result = rawSkills
      .filter(item => isYes(item.Result) || isYes(item.result) || isYes(item.Value) || isYes(item.Selected) || isYes(item.status))
      .map(item => item.English || item.Name || item.skill || item.label || item.Title || Object.values(item)[0]);
  }
  // 3. Handle Simple Array of Strings
  else if (Array.isArray(rawSkills)) {
    result = rawSkills.map(s => String(s).trim());
  }
  // 4. Handle Object (e.g. { Cooking: "YES", Cleaning: "NO" })
  else if (typeof rawSkills === 'object' && rawSkills !== null) {
    result = Object.entries(rawSkills)
      .filter(([_, value]) => isYes(value))
      .map(([key, _]) => key.replace(/_/g, ' '));
  }

  // Clean, remove duplicates, and filter out noise
  const noise = ['ID', 'WORKER_ID', 'CREATED_AT', 'UPDATED_AT'];
  return [...new Set(result.filter(s => s && typeof s === 'string' && !noise.includes(s.toUpperCase())))];
};

// Helper to normalize languages from diverse formats
export const getNormalizedLanguages = (worker) => {
  if (!worker) return [];

  const sources = [
    worker.languages,
    worker.raw_data?.languages,
    worker.raw_data?.Languages,
    worker.raw_data?.language,
    worker.raw_data?.["Languages"],
    worker.raw_data?.["Knowledge Of Language"],
    worker.raw_data?.["Knowledge of Language"],
    worker.raw_data?.["knowledge_of_language"],
    worker.raw_data?.["Language SubForm"],
    worker["Knowledge Of Language"],
    worker["Languages"]
  ];

  let rawLangs = sources.find(l => l !== undefined && l !== null) || [];
  let result = [];

  // 1. Handle Comma String
  if (typeof rawLangs === 'string') {
    result = rawLangs.split(',').map(l => l.trim());
  }
  // 2. Handle Array of Objects (e.g. [{ English: "English", Rate: 60 }])
  else if (Array.isArray(rawLangs) && rawLangs.length > 0 && typeof rawLangs[0] === 'object') {
    result = rawLangs.map(item => {
      const name = item.English || item.language || item.name || item.Arabic || item.Label || Object.values(item)[0];
      const rate = item.Rate || item.rate || item.Level || item.level || item.Percentage || item.proficiency;
      
      if (!name) return null;
      if (rate && (isYes(rate) || typeof rate === 'number' || (typeof rate === 'string' && rate.length > 0 && !rate.toUpperCase().includes('NO')))) {
          return `${name}${rate && typeof rate !== 'boolean' && !isYes(rate) ? ` (${rate}${typeof rate === 'number' ? '%' : ''})` : ''}`;
      }
      return isYes(item.Result) || isYes(item.result) || !item.Result ? name : null;
    });
  }
  // 3. Handle Simple Array
  else if (Array.isArray(rawLangs)) {
    result = rawLangs.map(l => String(l).trim());
  }
  // 4. Handle Object
  else if (typeof rawLangs === 'object' && rawLangs !== null) {
    result = Object.entries(rawLangs)
      .filter(([_, value]) => value && value !== 'NO' && value !== 'No' && value !== '0')
      .map(([key, value]) => typeof value === 'string' && !isYes(value) ? `${key} (${value})` : key);
  }

  return [...new Set(result.filter(Boolean))];
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
