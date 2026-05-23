import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const defaultFilters = {
  search: '',
  nationalities: [],
  ageRange: [18, 60],
  religions: [],
  maritalStatuses: [],
  experiences: [],
  skills: [],
  languages: [],
  children: 'الكل',
  warranty: 'الكل',
  location: 'الكل',
  hasPreviousExperience: false,
  experienceCountries: []
};

export const useFilters = (workers) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialFilters = () => {
    const init = { ...defaultFilters };
    if (searchParams.get('search')) init.search = searchParams.get('search');
    if (searchParams.get('nationalities')) init.nationalities = searchParams.get('nationalities').split(',');
    if (searchParams.get('ageMin') && searchParams.get('ageMax')) init.ageRange = [parseInt(searchParams.get('ageMin')), parseInt(searchParams.get('ageMax'))];
    if (searchParams.get('religions')) init.religions = searchParams.get('religions').split(',');
    if (searchParams.get('maritalStatuses')) init.maritalStatuses = searchParams.get('maritalStatuses').split(',');
    if (searchParams.get('experiences')) init.experiences = searchParams.get('experiences').split(',');
    if (searchParams.get('skills')) init.skills = searchParams.get('skills').split(',');
    if (searchParams.get('languages')) init.languages = searchParams.get('languages').split(',');
    if (searchParams.get('children')) init.children = searchParams.get('children');
    if (searchParams.get('warranty')) init.warranty = searchParams.get('warranty');
    if (searchParams.get('location')) init.location = searchParams.get('location');
    if (searchParams.get('hasPreviousExperience')) init.hasPreviousExperience = searchParams.get('hasPreviousExperience') === 'true';
    if (searchParams.get('experienceCountries')) init.experienceCountries = searchParams.get('experienceCountries').split(',');
    return init;
  };

  const [filters, setFilters] = useState(getInitialFilters);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.nationalities.length > 0) params.set('nationalities', filters.nationalities.join(','));
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) {
      params.set('ageMin', filters.ageRange[0]);
      params.set('ageMax', filters.ageRange[1]);
    }
    if (filters.religions.length > 0) params.set('religions', filters.religions.join(','));
    if (filters.maritalStatuses.length > 0) params.set('maritalStatuses', filters.maritalStatuses.join(','));
    if (filters.experiences.length > 0) params.set('experiences', filters.experiences.join(','));
    if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
    if (filters.languages.length > 0) params.set('languages', filters.languages.join(','));
    if (filters.children !== 'الكل') params.set('children', filters.children);
    if (filters.warranty !== 'الكل') params.set('warranty', filters.warranty);
    if (filters.location !== 'الكل') params.set('location', filters.location);
    if (filters.hasPreviousExperience) params.set('hasPreviousExperience', 'true');
    if (filters.experienceCountries.length > 0) params.set('experienceCountries', filters.experienceCountries.join(','));
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const searchTerm = filters.search.toLowerCase();
      const matchSearch = !filters.search || 
                          worker.Worker_Name.toLowerCase().includes(searchTerm) || 
                          worker.Worker_No.toLowerCase().includes(searchTerm) ||
                          worker.Nationality.toLowerCase().includes(searchTerm);
      
      const matchNationality = filters.nationalities.length === 0 || filters.nationalities.includes(worker.Nationality);
      
      const age = parseInt(worker.Age);
      const matchAge = age >= filters.ageRange[0] && age <= filters.ageRange[1];
      
      const matchReligion = filters.religions.length === 0 || filters.religions.includes(worker.Religion);
      
      const matchMarital = filters.maritalStatuses.length === 0 || filters.maritalStatuses.includes(worker.Marital_Status);
      
      const matchExperience = filters.experiences.length === 0 || filters.experiences.includes(worker.Experience);
      
      const matchSkills = filters.skills.length === 0 || filters.skills.every(skill => worker.Skills.includes(skill));
      
      const matchLanguages = filters.languages.length === 0 || filters.languages.every(lang => worker.Languages.includes(lang));
      
      const matchChildren = filters.children === 'الكل' || 
                           (filters.children === '3+' ? parseInt(worker.Number_Of_Children) >= 3 : worker.Number_Of_Children === filters.children);
      
      const matchWarranty = filters.warranty === 'الكل' || filters.warranty === 'سنتين';
      
      const matchLocation = filters.location === 'الكل' || 
                           (filters.location === 'داخل الدولة' ? worker.Location === 'Inside Country' : worker.Location === 'Outside Country');

      const matchHasExp = !filters.hasPreviousExperience || (worker.WorkExperience && worker.WorkExperience.length > 0);
      
      const matchExpCountry = filters.experienceCountries.length === 0 || 
                           (worker.WorkExperience && worker.WorkExperience.some(exp => filters.experienceCountries.includes(exp.country)));

      return matchSearch && matchNationality && matchAge && matchReligion && matchMarital && 
             matchExperience && matchSkills && matchLanguages && matchChildren && matchWarranty && matchLocation && matchHasExp && matchExpCountry;
    });
  }, [workers, filters]);


  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key, value) => {
    setFilters(prev => {
      const current = prev[key];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  return { filters, filteredWorkers, updateFilter, toggleMultiSelect, clearFilters };
};
