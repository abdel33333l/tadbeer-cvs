// Helper to normalize skills from diverse formats
export const getNormalizedSkills = (raw) => {
  if (!raw) return [];
  
  let skills = raw.skills || raw.Skills || raw.skill || raw["Skills"] || raw["Skills SubForm"] || raw["Skills_SubForm.English"] || raw["Skills_SubForm"] || [];
  
  // 1. Handle String (comma separated)
  if (typeof skills === 'string') {
    return skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // 2. Handle Object (YES/NO values)
  if (skills && typeof skills === 'object' && !Array.isArray(skills)) {
    return Object.entries(skills)
      .filter(([_, value]) => value === true || value === 'YES' || value === 'Yes' || value === 'yes')
      .map(([key, _]) => key.replace(/_/g, ' '))
      .filter(Boolean);
  }
  
  // 3. Handle Array
  if (Array.isArray(skills)) {
    return skills.map(s => String(s).trim()).filter(Boolean);
  }
  
  return [];
};

// Helper to normalize languages
export const getNormalizedLanguages = (raw) => {
  if (!raw) return [];
  
  let langs = raw.languages || raw.Languages || raw.language || raw["Languages"] || raw["Knowledge Of Language"] || raw["Knowledge_Of_Language_SubForm.English"] || raw["Knowledge_Of_Language_SubForm"] || [];
  
  if (typeof langs === 'string') {
    return langs.split(',').map(l => l.trim()).filter(Boolean);
  }
  
  if (langs && typeof langs === 'object' && !Array.isArray(langs)) {
    return Object.entries(langs)
      .filter(([_, value]) => value && value !== 'NO' && value !== 'No' && value !== 'no')
      .map(([key, value]) => typeof value === 'string' && value !== 'YES' ? `${key} (${value})` : key)
      .filter(Boolean);
  }
  
  if (Array.isArray(langs)) {
    return langs.map(l => String(l).trim()).filter(Boolean);
  }
  
  return [];
};
