const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const zohoCookie = process.env.ZOHO_COOKIE;
const reportBase = (process.env.ZOHO_CREATOR_REPORT_BASE || process.env.ZOHO_CREATOR_BASE_URL || "https://creatorapp.zoho.com/eitmam/eitmam-erp/report/All_Workers").replace(/\/+$/, "");
const digestValue = process.env.ZOHO_DIGEST_VALUE || "eyJsYW5ndWFnZSI6ImVuIn0=";

const watchMode = process.env.WATCH_MODE === 'true';
const retryFailed = process.env.RETRY_FAILED === 'true';
const watchInterval = parseInt(process.env.WATCH_INTERVAL_SECONDS || '30') * 1000;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Cookie Validation
if (!zohoCookie) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: ZOHO_COOKIE is missing. Paste a fresh Zoho cookie into .env.local');
  process.exit(1);
}

if (zohoCookie.length < 50) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: ZOHO_COOKIE seems too short. Ensure you copied the full cookie string.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Build Zoho image URL candidates
 */
function getZohoCandidates(worker) {
  const raw = worker.raw_data || {};
  
  const recordId =
    worker.zoho_record_id ||
    raw.ID ||
    raw.id ||
    raw["ID"];

  const photoPath =
    worker.zoho_photo_path ||
    raw.Photo ||
    raw.photo ||
    raw["Photo"];

  if (!recordId || !photoPath) return [];

  const filename = String(photoPath).split("/").pop();
  if (!filename) return [];

  // Use only the working download-file format with digestValue
  const downloadUrl = `${reportBase}/${recordId}/Photo/download-file?filepath=/${encodeURIComponent(filename)}&digestValue=${encodeURIComponent(digestValue)}`;

  // DEBUG for each worker
  console.log(`\x1b[34m%s\x1b[0m`, `--- Worker Data ---`);
  console.log(`Worker code: ${worker.worker_code}`);
  console.log(`Record ID: ${recordId}`);
  console.log(`Filename: ${filename}`);
  console.log(`Final Zoho URL: ${downloadUrl}`);

  return [downloadUrl];
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
    if (response.status === 404) {
        throw new Error(`404: Zoho image URL returned 404.`);
    }
    if (response.status === 403 || response.status === 401) {
       throw new Error(`403/401: Unauthorized. Cookie may be expired.`);
    }
    throw new Error(`Zoho fetch failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    const text = await response.text();
    console.warn(`\x1b[33m%s\x1b[0m`, `Zoho returned HTML snippet: ${text.slice(0, 300).replace(/\s+/g, ' ')}...`);
    throw new Error(`Zoho returned HTML/login page. Cookie may be expired or digestValue is wrong.`);
  }

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
    console.log('Insufficient data for Zoho photo import, skipping.');
    return;
  }

  let lastError = "";
  for (const url of candidates) {
    try {
      const { buffer, contentType } = await fetchZohoImage(url);
      
      console.log(`Uploading to Supabase Storage...`);
      const publicUrl = await uploadToSupabase(worker, buffer, contentType);
      
      console.log(`\x1b[32m%s\x1b[0m`, `Success! Photo uploaded.`);
      
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
      console.warn(`\x1b[33m%s\x1b[0m`, `Import failed: ${error.message}`);
    }
  }

  // All candidates failed
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
  console.log('\n\x1b[36m%s\x1b[0m', 'Checking for workers needing photo import in Supabase...');

  let query = supabase.from("workers").select("*");
  
  if (retryFailed) {
      query = query.or(`photo_import_status.eq.pending,photo_import_status.eq.failed,portrait_image_url.is.null`);
  } else {
      query = query.or(`photo_import_status.eq.pending,portrait_image_url.is.null`);
  }

  const { data: workers, error } = await query.not('zoho_photo_path', 'is', null);

  if (error) {
    console.error('Supabase fetch error:', error);
    return;
  }

  const pendingWorkers = workers.filter(w => w.photo_import_status !== 'done' && w.photo_import_status !== 'no_photo');

  if (pendingWorkers.length === 0) {
    console.log('No workers found matching import criteria.');
    return;
  }

  console.log(`Found ${pendingWorkers.length} workers to process.`);

  for (const worker of pendingWorkers) {
    try {
      await processWorker(worker);
    } catch (e) {
      // Catch errors in the loop to prevent script from stopping
      console.error(`\x1b[31m%s\x1b[0m`, `Worker ${worker.worker_code} encountered a loop error: ${e.message}`);
    }
  }

  console.log('\x1b[32m%s\x1b[0m', '\nCycle finished.');
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
