import { useState, useEffect } from 'react';
import { get, set, del } from 'idb-keyval';
import { parsePdfForWorkerData, normalizePassport } from '../utils/pdfParser';

const WORKERS_KEY = 'tadbeer_workers_v3'; // Changed key for IndexedDB
const WHATSAPP_KEY = 'tadbeer_whatsapp';
const DEFAULT_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '+971508368230';

export const useWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedWorkers = await get(WORKERS_KEY);
        const savedWhatsapp = localStorage.getItem(WHATSAPP_KEY);

        if (savedWorkers) {
          setWorkers(savedWorkers);
        }
        if (savedWhatsapp) {
          setWhatsappNumber(savedWhatsapp);
        }
      } catch (err) {
        console.error('Error loading data from IDB:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const uploadData = async (jsonFile, pdfFile = null) => {
    setIsLoading(true);
    try {
      // 1. Parse JSON
      const jsonText = await jsonFile.text();
      const jsonData = JSON.parse(jsonText);
      
      if (!jsonData || !jsonData.All_Workers) {
        throw new Error('Invalid JSON format');
      }

      let processedWorkers = jsonData.All_Workers.map(worker => ({
        ...worker,
        Skills: worker["Skills_SubForm.English"] ? worker["Skills_SubForm.English"].split(',').map(s => s.trim()) : [],
        Languages: worker["Knowledge_Of_Language_SubForm.English"] ? worker["Knowledge_Of_Language_SubForm.English"].split(',').map(l => l.trim()) : [],
        WorkExperience: [] // Default to empty array
      }));

      let expMatchedCount = 0;
      let noExpCount = processedWorkers.length;

      // 2. Process PDF for Experience AND Photo if provided
      if (pdfFile) {
        const pdfPages = await parsePdfForWorkerData(pdfFile);
        
        processedWorkers = processedWorkers.map(worker => {
          const workerPassport = normalizePassport(worker.Passport_Number);
          const workerNo = (worker.Worker_No || '').toUpperCase().replace(/\s+/g, '');
          
          // Find matching page by checking if the normalized page text contains the worker's passport or worker number
          const matchingPage = pdfPages.find(p => {
            const normalizedPdfText = (p.rawText || '').replace(/\s+/g, '').toUpperCase();
            return (workerPassport && normalizedPdfText.includes(workerPassport)) || 
                   (workerNo && normalizedPdfText.includes(workerNo)) || 
                   p.passport === workerPassport;
          });
          
          if (matchingPage) {
            let updatedWorker = { ...worker };

            if (matchingPage.experience.length > 0) {
              expMatchedCount++;
              noExpCount--;
              updatedWorker.WorkExperience = matchingPage.experience;
            }

            if (matchingPage.profileImage) {
              updatedWorker.portraitImage = matchingPage.profileImage;
              updatedWorker.fullBodyImage = matchingPage.fullBodyImage;
              
              // Maintain backward compatibility if needed, but the UI will be updated to use the new fields
              updatedWorker.Photo = matchingPage.profileImage;
              updatedWorker.Full_Image = matchingPage.fullBodyImage || matchingPage.profileImage;
            }

            return updatedWorker;
          } else {
            console.log(`No PDF match found for passport: ${worker.Passport_Number}`);
          }
          
          return worker;
        });
      }

      // 3. Save to IndexedDB (prevent quota limits)
      await set(WORKERS_KEY, processedWorkers);
      setWorkers(processedWorkers);
      
      return {
        total: processedWorkers.length,
        expMatched: expMatchedCount,
        noExp: noExpCount
      };
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWhatsapp = (number) => {
    setWhatsappNumber(number);
    localStorage.setItem(WHATSAPP_KEY, number);
  };

  const clearAllData = async () => {
    await del(WORKERS_KEY);
    setWorkers([]);
  };

  return { workers, whatsappNumber, isLoading, uploadData, updateWhatsapp, clearAllData };
};
