import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parsePdfForWorkerData, normalizePassport } from '../utils/pdfParser';
import { getNormalizedSkills, getNormalizedLanguages, getWorkerPhone, getZohoImageUrlCandidates, findPossibleImagePath } from '../utils/normalization';
import { enhanceImage, resizeImage } from '../utils/imageProcessor';
import { get, set, del } from 'idb-keyval';

const WORKERS_KEY = 'tadbeer_workers_v3';
const WHATSAPP_KEY = 'tadbeer_whatsapp';
const DEFAULT_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '971508368230';
const DEFAULT_PHONE = import.meta.env.VITE_OFFICE_PHONE || '0508368230';

// Helper to convert Data URL to Blob
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

// Supported Supabase columns
const VALID_COLUMNS = [
  'worker_code', 'name', 'nationality', 'country', 'age', 'religion', 
  'marital_status', 'experience', 'previous_experience_country', 'work_experience', 
  'previous_experience', 'experience_details', 'skills', 'languages', 
  'salary', 'guarantee', 'status', 'portrait_image_url', 'full_body_image_url', 
  'passport_number', 'date_of_birth', 'place_of_birth', 'phone', 'mobile', 'raw_data',
  'photo_import_status', 'photo_import_error', 'photo_imported_at', 'zoho_photo_path', 'zoho_record_id'
];

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
      const savedWhatsapp = localStorage.getItem(WHATSAPP_KEY);
      if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedWorkers = data.map(w => ({
          ...w.raw_data,
          ...w, // Use clean fields from DB
          id: w.id,
          worker_id_db: w.id,
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
          await addWorker(worker, false);
        }
        localStorage.setItem('supabase_migration_done', 'true');
        fetchData();
      }
    } catch (err) {
      console.warn('Migration failed', err);
    }
  };

  const normalizeWorker = (raw) => {
    // 1. Map fields flexibly
    const name = raw.name || raw.Name || raw.fullName || raw["Worker Name"] || raw["Worker_Name"] || "N/A";
    let worker_code = raw.worker_code || raw.code || raw.ref || raw.id || raw["Ref No"] || raw["Worker No"] || raw["Worker_No"];
    
    // Auto-generate worker code if missing
    if (!worker_code) {
       worker_code = `W${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    
    const nationality = raw.nationality || raw.country || raw.Nationality || raw["Nationality"] || "N/A";
    const country = raw.country || raw.Country || raw["Country"] || "";
    const religion = raw.religion || raw.Religion || raw["Religion"] || "N/A";
    const age = parseInt(raw.age || raw.Age || raw["Age"]) || null;
    const marital_status = raw.marital_status || raw.maritalStatus || raw["Marital Status"] || raw["Marital_Status"] || "N/A";
    const experience = raw.experience || raw.Experience || raw["Experience"] || "Beginner";
    const passport_number = raw.passport_number || raw.passportNo || raw["Passport No"] || raw["Passport_Number"] || "";
    const date_of_birth = raw.date_of_birth || raw.dob || raw["Date of Birth"] || raw["Date_Of_Birth"] || "";
    const place_of_birth = raw.place_of_birth || raw.pob || raw["Place of Birth"] || raw["Place_Of_Birth"] || "";
    const salary = raw.salary || raw.Salary || raw["Salary"] || null;
    const guarantee = raw.guarantee || raw.Guarantee || raw["Guarantee"] || "سنتين";
    const status = raw.status || raw.Status || raw["Status"] || "available";

    // 2. Map skills and languages using robust helpers
    const skills = getNormalizedSkills(raw);
    const languages = getNormalizedLanguages(raw);
    const phone = getWorkerPhone(raw);

    const work_experience = raw.WorkExperience || raw.work_experience || [];
    const previous_experience_country = raw.previous_experience_country || (work_experience.length > 0 ? work_experience[0].country : null);

    // Zoho Specifics for Local Importer
    const zoho_record_id = raw.ID || raw.id || raw.record_id || raw["ID"] || null;
    const zoho_photo_path = raw.Photo || raw.photo || raw["Photo"] || null;
    
    let photo_import_status = 'no_photo';
    if (zoho_photo_path) {
      photo_import_status = (raw.portrait_image_url || (typeof raw.Photo === 'string' && raw.Photo.startsWith('http'))) ? 'done' : 'pending';
    }

    return {
      worker_code,
      name,
      nationality,
      country,
      age,
      religion,
      marital_status,
      experience,
      skills,
      languages,
      salary,
      guarantee,
      status,
      passport_number,
      date_of_birth,
      place_of_birth,
      work_experience,
      previous_experience: raw.previous_experience || [],
      experience_details: raw.experience_details || "",
      previous_experience_country,
      phone,
      mobile: phone,
      portrait_image_url: raw.portrait_image_url || (typeof raw.Photo === 'string' && raw.Photo.startsWith('http') ? raw.Photo : null),
      full_body_image_url: raw.full_body_image_url || null,
      zoho_record_id,
      zoho_photo_path,
      photo_import_status,
      raw_data: raw
    };
  };

  const uploadWorkerImage = async (dataUrl, type, workerNo) => {
    if (!dataUrl || dataUrl.length < 100) return null;
    
    try {
      const blob = await dataUrlToBlob(dataUrl);
      const fileName = `${workerNo}/${type}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('worker-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '31536000'
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('worker-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.error(`Image upload failed for ${workerNo} (${type}):`, err);
      return null;
    }
  };

  const importZohoPortraitViaApi = async (rawWorker, workerCode) => {
    const imageUrls = getZohoImageUrlCandidates(rawWorker);

    if (!imageUrls.length) return null;

    try {
      const response = await fetch("/api/import-zoho-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls,
          workerCode,
          type: "portrait",
        }),
      });

      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.warn("Zoho API returned non-JSON response:", text);
        return null;
      }

      if (!response.ok || !result.success) {
        console.warn("Zoho server import failed:", result.error || "Unknown error");
        return null;
      }

      return result.publicUrl;
    } catch (error) {
      console.warn("Zoho import API call failed:", error);
      return null;
    }
  };

  const addWorker = async (worker, shouldRefresh = true) => {
    try {
      const normalized = normalizeWorker(worker);
      
      // 1. Try importing Zoho high-quality photo via Proxy API (Resolves CORS)
      const zohoPortraitUrl = await importZohoPortraitViaApi(worker, normalized.worker_code);
      if (zohoPortraitUrl) {
        normalized.portrait_image_url = zohoPortraitUrl;
      }

      // 2. Handle fallback PDF Images if they are Data URLs and Zoho failed
      if (!normalized.portrait_image_url && worker.portraitImage && worker.portraitImage.startsWith('data:')) {
        normalized.portrait_image_url = await uploadWorkerImage(worker.portraitImage, 'portrait', normalized.worker_code);
      }
      if (worker.fullBodyImage && worker.fullBodyImage.startsWith('data:')) {
        normalized.full_body_image_url = await uploadWorkerImage(worker.fullBodyImage, 'fullbody', normalized.worker_code);
      }

      // 3. Ensure only valid columns are sent
      const record = {};
      VALID_COLUMNS.forEach(col => {
        if (normalized[col] !== undefined) record[col] = normalized[col];
      });

      // 4. Upsert into Supabase
      const { data, error } = await supabase
        .from('workers')
        .upsert(record, { onConflict: 'worker_code' })
        .select()
        .single();

      if (error) {
        if (error.message?.includes('column')) {
           throw new Error(`قاعدة البيانات غير محدثة. يرجى إضافة العمود: ${error.message.split('"')[1]}`);
        }
        throw error;
      }
      
      if (shouldRefresh) await fetchData();
      return data;
    } catch (err) {
      console.error('Failed to add/upsert worker:', err);
      throw err;
    }
  };

  const uploadData = async (jsonFile, pdfFile = null, onProgress, mode = 'upsert', options = {}) => {
    setIsLoading(true);
    try {
      // STEP 1: JSON Reading
      onProgress?.('جاري قراءة ملف JSON...');
      let jsonData;
      try {
        const jsonText = await jsonFile.text();
        jsonData = JSON.parse(jsonText);
      } catch (e) {
        throw new Error('تنسيق ملف JSON غير صحيح');
      }

      // STEP 2: Flexible Structure Detection
      let workersArray = [];
      if (Array.isArray(jsonData)) workersArray = jsonData;
      else if (jsonData.All_Workers && Array.isArray(jsonData.All_Workers)) workersArray = jsonData.All_Workers;
      else if (jsonData.workers && Array.isArray(jsonData.workers)) workersArray = jsonData.workers;
      else if (jsonData.data && Array.isArray(jsonData.data)) workersArray = jsonData.data;
      else if (jsonData.results && Array.isArray(jsonData.results)) workersArray = jsonData.results;
      else throw new Error("تنسيق ملف JSON غير مدعوم");

      if (workersArray.length === 0) throw new Error("الملف لا يحتوي على أي عاملات");

      // DEBUG: Log first raw worker to identify keys
      if (workersArray.length > 0) {
        const rawWorker = workersArray[0];
        console.log("FIRST RAW WORKER:", rawWorker);
        console.log("FIRST RAW WORKER KEYS:", Object.keys(rawWorker));

        const languageRelatedKeys = Object.keys(rawWorker).filter(k =>
          k.toLowerCase().includes("language") ||
          k.toLowerCase().includes("english") ||
          k.toLowerCase().includes("arabic") ||
          k.toLowerCase().includes("knowledge") ||
          k.includes("الإنجليزية") ||
          k.includes("الانجليزية") ||
          k.includes("العربية")
        );
        console.log("LANGUAGE RELATED KEYS:", languageRelatedKeys);
        console.log("LANGUAGE RELATED VALUES:", languageRelatedKeys.map(k => [k, rawWorker[k]]));
      }

      onProgress?.(`تم التحقق من البيانات. (العدد: ${workersArray.length})`);

      // STEP 3: Replace Mode Cleanup
      if (mode === 'replace') {
        onProgress?.('جاري حذف البيانات القديمة...');
        const { error: delError } = await supabase
          .from('workers')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (delError) throw new Error("فشل حذف البيانات القديمة");
      }

      // STEP 4: PDF Processing (Optional)
      let pdfPages = [];
      if (pdfFile) {
        onProgress?.('جاري استخراج البيانات والصور من ملف PDF...');
        try {
          pdfPages = await parsePdfForWorkerData(pdfFile);
        } catch (e) {
          onProgress?.('تنبيه: فشل معالجة PDF، سيتم رفع البيانات النصية فقط.');
        }
      }

      // STEP 5: Main Upload Loop
      let successCount = 0;
      let imgCount = 0;
      let zohoFailCount = 0;

      for (let i = 0; i < workersArray.length; i++) {
        const rawWorker = workersArray[i];
        onProgress?.(`جاري معالجة ورفع العاملة ${i + 1} من ${workersArray.length}...`);

        if (pdfPages.length > 0) {
          const passport = (rawWorker.Passport_Number || rawWorker.passport_number || rawWorker["Passport No"] || "").toUpperCase().replace(/\s+/g, '');
          const workerNo = (rawWorker.Worker_No || rawWorker.worker_code || rawWorker["Ref No"] || "").toUpperCase().replace(/\s+/g, '');
          
          const matchingPage = pdfPages.find(p => {
            const normalizedPdfText = (p.rawText || '').replace(/\s+/g, '').toUpperCase();
            return (passport && normalizedPdfText.includes(passport)) || 
                   (workerNo && normalizedPdfText.includes(workerNo)) || 
                   p.passport === passport;
          });

          if (matchingPage) {
            let portrait = matchingPage.profileImage;
            let fullBody = matchingPage.fullBodyImage;

            // Optional Enhancement & Resizing
            if (options.enhance) {
              onProgress?.(`جاري تحسين جودة صورة العاملة ${i + 1}...`);
              
              if (portrait) {
                const oldSize = portrait.length;
                portrait = await enhanceImage(portrait);
                portrait = await resizeImage(portrait, 900, 900);
                if (import.meta.env.DEV) console.log(`Portrait enhanced: ${oldSize} -> ${portrait.length}`);
              }
              if (fullBody) {
                const oldSize = fullBody.length;
                fullBody = await enhanceImage(fullBody);
                fullBody = await resizeImage(fullBody, 1200, 1800);
                if (import.meta.env.DEV) console.log(`FullBody enhanced: ${oldSize} -> ${fullBody.length}`);
              }
            }

            rawWorker.WorkExperience = matchingPage.experience;
            rawWorker.portraitImage = portrait;
            rawWorker.fullBodyImage = fullBody;
          }
        }

        try {
          const res = await addWorker(rawWorker, false);
          
          // Check if Zoho import was skipped or failed
          if (findPossibleImagePath(rawWorker) && res && !res.portrait_image_url) {
             zohoFailCount++;
          }

          if (res && (res.portrait_image_url || res.full_body_image_url)) imgCount++;
          successCount++;
        } catch (e) {
          console.error(`Failed at worker ${i}:`, e);
        }
      }

      await fetchData();
      
      return {
        total: workersArray.length,
        success: successCount,
        failed: workersArray.length - successCount,
        images: imgCount,
        zohoWarning: zohoFailCount > 0
      };
    } catch (err) {
      console.error('Upload Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorker = async (id) => {
    try {
      const { error } = await supabase.from('workers').delete().eq('id', id);
      if (error) throw error;
      setWorkers(prev => prev.filter(w => w.worker_id_db !== id));
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
      const { error } = await supabase
        .from('workers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setWorkers([]);
    } catch (err) {
      console.error('Clear failed:', err);
      throw err;
    }
  };

  return { workers, whatsappNumber, isLoading, uploadData, updateWhatsapp, clearAllData, deleteWorker, addWorker };
};
