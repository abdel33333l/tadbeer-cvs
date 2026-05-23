const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const zohoCookie = process.env.ZOHO_COOKIE;
const zohoBaseUrl = process.env.ZOHO_CREATOR_BASE_URL || 'https://creatorapp.zoho.com/eitmam/eitmam-erp/report/All_Workers';
const watchMode = process.env.WATCH_MODE === 'true';
const watchInterval = parseInt(process.env.WATCH_INTERVAL_SECONDS || '30') * 1000;

if (!supabaseUrl || !supabaseServiceRoleKey || !zohoCookie) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or ZOHO_COOKIE in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Build Zoho image URL candidates
 */
function getZohoCandidates(worker) {
  const raw = worker.raw_data || {};
  const recordId = worker.zoho_record_id || raw.ID || raw.id;
  const photoPath = worker.zoho_photo_path || raw.Photo || raw.photo;

  if (!recordId || !photoPath) return [];

  const cleanBase = zohoBaseUrl.replace(/\/+$/, "");
  const filename = String(photoPath).split("/").pop();

  const candidates = [];

  // Format 1: download-file URL
  if (filename) {
    candidates.push(
      `${cleanBase}/${recordId}/Photo/download-file?filepath=/${encodeURIComponent(filename)}`
    );
  }

  // Format 2: relative path
  if (String(photoPath).startsWith("/")) {
    candidates.push(`${cleanBase}${photoPath}`);
  }

  return [...new Set(candidates)];
}

/**
 * Fetch with Zoho cookie
 */
async function fetchZohoImage(url) {
  const response = await fetch(url, {
    headers: {
      Cookie: zohoCookie,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
       throw new Error('ZOHO_COOKIE might be expired or invalid.');
    }
    throw new Error(`Zoho fetch failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    throw new Error(`URL did not return an image. Content-Type: ${contentType}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  };
}

/**
 * Upload to Supabase
 */
async function uploadToSupabase(worker, imageBuffer, contentType) {
  const workerCode = String(worker.worker_code || worker.raw_data?.Worker_No || worker.id)
    .replace(/[^a-zA-Z0-9_-]/g, "");

  const extension =
    contentType.includes("png") ? "png" :
    contentType.includes("webp") ? "webp" :
    "jpg";

  const filePath = `${workerCode}/portrait-zoho.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("worker-images")
    .upload(filePath, imageBuffer, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("worker-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Process a single worker
 */
async function processWorker(worker) {
  console.log(`\nProcessing Worker: ${worker.worker_code || worker.name}...`);
  
  const candidates = getZohoCandidates(worker);
  if (candidates.length === 0) {
    console.log('No Zoho photo path found, skipping.');
    return;
  }

  let lastError = "";
  for (const url of candidates) {
    try {
      console.log(`Fetching from Zoho: ${url.substring(0, 80)}...`);
      const { buffer, contentType } = await fetchZohoImage(url);
      
      console.log(`Uploading to Supabase Storage...`);
      const publicUrl = await uploadToSupabase(worker, buffer, contentType);
      
      console.log(`\x1b[32m%s\x1b[0m`, `Success! Public URL: ${publicUrl}`);
      
      await supabase
        .from("workers")
        .update({
          portrait_image_url: publicUrl,
          photo_import_status: "done",
          photo_import_error: null,
          photo_imported_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", worker.id);
        
      return;
    } catch (error) {
      lastError = error.message;
      console.warn(`Candidate failed: ${error.message}`);
      if (error.message.includes('expired')) throw error; // Stop if cookie is dead
    }
  }

  // All candidates failed
  console.error(`\x1b[31m%s\x1b[0m`, `Failed to import photo for ${worker.worker_code}`);
  await supabase
    .from("workers")
    .update({
      photo_import_status: "failed",
      photo_import_error: lastError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", worker.id);
}

/**
 * Main Importer Loop
 */
async function runImporter() {
  console.log('\x1b[36m%s\x1b[0m', 'Checking for pending worker photos in Supabase...');

  const { data: workers, error } = await supabase
    .from("workers")
    .select("*")
    .or(`photo_import_status.eq.pending,portrait_image_url.is.null`)
    .not('zoho_photo_path', 'is', null);

  if (error) {
    console.error('Supabase fetch error:', error);
    return;
  }

  // Filter out those that are already 'done' if they were matched by the portrait_image_url.is.null condition
  const pendingWorkers = workers.filter(w => w.photo_import_status !== 'done' && w.photo_import_status !== 'no_photo');

  if (pendingWorkers.length === 0) {
    console.log('No pending photos found.');
    return;
  }

  console.log(`Found ${pendingWorkers.length} pending photos.`);

  for (const worker of pendingWorkers) {
    try {
      await processWorker(worker);
    } catch (e) {
      if (e.message.includes('expired')) {
        console.error('\x1b[31m%s\x1b[0m', '\nFATAL ERROR: ' + e.message);
        process.exit(1);
      }
      console.error(`Worker ${worker.worker_code} processing failed:`, e.message);
    }
  }

  console.log('\x1b[32m%s\x1b[0m', '\nImporter task finished.');
  if (!watchMode) {
    console.log('Done. You can delete ZOHO_COOKIE from .env.local if you are finished.');
  }
}

/**
 * Entry point
 */
if (watchMode) {
  console.log('\x1b[35m%s\x1b[0m', `Watching Supabase every ${watchInterval/1000}s for new workers... (Ctrl+C to stop)`);
  setInterval(runImporter, watchInterval);
  runImporter();
} else {
  runImporter();
}
