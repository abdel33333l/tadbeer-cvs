import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parsePdfForWorkerData, normalizePassport } from '../utils/pdfParser';
import { get, set, del } from 'idb-keyval';

const WORKERS_KEY = 'tadbeer_workers_v3';
const WHATSAPP_KEY = 'tadbeer_whatsapp';
const DEFAULT_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '+971508368230';

// Helper to convert Data URL to Blob
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

export const useWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Load WhatsApp from localStorage (keep it local for agency preferences)
      const savedWhatsapp = localStorage.getItem(WHATSAPP_KEY);
      if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);

      // 2. Fetch Workers from Supabase
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map Supabase fields to app fields
        const mappedWorkers = data.map(w => ({
          ...w.raw_data,
          id: w.id,
          portraitImage: w.portrait_image_url,
          fullBodyImage: w.full_body_image_url,
          Photo: w.portrait_image_url,
          Full_Image: w.full_body_image_url,
          Skills: w.skills || [],
          Languages: w.languages || [],
          WorkExperience: w.work_experience || []
        }));
        setWorkers(mappedWorkers);
      } else {
        // 3. Try Migration if Supabase is empty
        await runMigration();
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runMigration = async () => {
    const isMigrated = localStorage.getItem('supabase_migration_done');
    if (isMigrated) return;

    try {
      const localWorkers = await get(WORKERS_KEY);
      if (localWorkers && localWorkers.length > 0) {
        console.log('Starting migration to Supabase...');
        
        for (const worker of localWorkers) {
          await addWorker(worker, false); // Add without refreshing the whole list each time
        }
        
        localStorage.setItem('supabase_migration_done', 'true');
        fetchData(); // Refresh list after migration
      }
    } catch (err) {
      console.warn('Migration failed', err);
    }
  };

  const uploadWorkerImage = async (dataUrl, type, workerNo) => {
    if (!dataUrl || dataUrl.length < 100) return null;
    
    try {
      const blob = await dataUrlToBlob(dataUrl);
      const fileName = `${workerNo}/${type}-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('worker-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('worker-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  };

  const addWorker = async (worker, shouldRefresh = true) => {
    try {
      // 1. Handle Images if they are Data URLs
      let portraitUrl = worker.portraitImage;
      let fullBodyUrl = worker.fullBodyImage;

      if (portraitUrl && portraitUrl.startsWith('data:')) {
        portraitUrl = await uploadWorkerImage(portraitUrl, 'portrait', worker.Worker_No);
      }
      if (fullBodyUrl && fullBodyUrl.startsWith('data:')) {
        fullBodyUrl = await uploadWorkerImage(fullBodyUrl, 'fullbody', worker.Worker_No);
      }

      // 2. Prepare Supabase record
      const record = {
        worker_code: worker.Worker_No,
        name: worker.Worker_Name,
        nationality: worker.Nationality,
        age: parseInt(worker.Age) || null,
        religion: worker.Religion,
        marital_status: worker.Marital_Status,
        experience: worker.Experience,
        skills: worker.Skills || [],
        languages: worker.Languages || [],
        portrait_image_url: portraitUrl,
        full_body_image_url: fullBodyUrl,
        work_experience: worker.WorkExperience || [],
        passport_number: worker.Passport_Number,
        date_of_birth: worker.Date_Of_Birth,
        place_of_birth: worker.Place_Of_Birth,
        raw_data: worker // Keep original fields for safety
      };

      const { data, error } = await supabase
        .from('workers')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      
      if (shouldRefresh) await fetchData();
      return data;
    } catch (err) {
      console.error('Failed to add worker:', err);
      throw err;
    }
  };

  const uploadData = async (jsonFile, pdfFile = null) => {
    setIsLoading(true);
    try {
      const jsonText = await jsonFile.text();
      const jsonData = JSON.parse(jsonText);
      
      if (!jsonData || !jsonData.All_Workers) {
        throw new Error('Invalid JSON format');
      }

      let processedWorkers = jsonData.All_Workers.map(worker => ({
        ...worker,
        Skills: worker["Skills_SubForm.English"] ? worker["Skills_SubForm.English"].split(',').map(s => s.trim()) : [],
        Languages: worker["Knowledge_Of_Language_SubForm.English"] ? worker["Knowledge_Of_Language_SubForm.English"].split(',').map(l => l.trim()) : [],
        WorkExperience: []
      }));

      let expMatchedCount = 0;

      if (pdfFile) {
        const pdfPages = await parsePdfForWorkerData(pdfFile);
        processedWorkers = processedWorkers.map(worker => {
          const workerPassport = normalizePassport(worker.Passport_Number);
          const workerNo = (worker.Worker_No || '').toUpperCase().replace(/\s+/g, '');
          const matchingPage = pdfPages.find(p => {
            const normalizedPdfText = (p.rawText || '').replace(/\s+/g, '').toUpperCase();
            return (workerPassport && normalizedPdfText.includes(workerPassport)) || 
                   (workerNo && normalizedPdfText.includes(workerNo)) || 
                   p.passport === workerPassport;
          });
          
          if (matchingPage) {
            if (matchingPage.experience.length > 0) {
              expMatchedCount++;
              worker.WorkExperience = matchingPage.experience;
            }
            worker.portraitImage = matchingPage.profileImage;
            worker.fullBodyImage = matchingPage.fullBodyImage;
          }
          return worker;
        });
      }

      // Batch insert into Supabase
      // Note: For large datasets, we should do this in chunks
      for (const worker of processedWorkers) {
        await addWorker(worker, false);
      }

      await fetchData();
      
      return {
        total: processedWorkers.length,
        expMatched: expMatchedCount,
        noExp: processedWorkers.length - expMatchedCount
      };
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorker = async (id) => {
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWorkers(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      throw err;
    }
  };

  const updateWhatsapp = (number) => {
    setWhatsappNumber(number);
    localStorage.setItem(WHATSAPP_KEY, number);
  };

  const clearAllData = async () => {
    try {
      // 1. Clear Supabase
      const { error } = await supabase
        .from('workers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      // 2. Clear local
      await del(WORKERS_KEY);
      setWorkers([]);
    } catch (err) {
      console.error('Clear failed:', err);
      throw err;
    }
  };

  return { workers, whatsappNumber, isLoading, uploadData, updateWhatsapp, clearAllData, deleteWorker, addWorker };
};
