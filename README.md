# تدبير بوابه الشرق مول - Worker Listing Webapp

A mobile-first worker listing application designed for agency customers to browse, filter, and view worker profiles.

## Features

- **Mobile-First Design**: Optimized for older users with large tap targets and high readability.
- **Advanced Filtering**: Filter by nationality, age, religion, experience, and more.
- **URL Syncing**: Share specific filtered results with customers via shareable links.
- **CV Image Extraction**: Automatically extracts portrait and full-body images from uploaded worker PDFs.
- **Offline Storage**: Uses IndexedDB for fast local data access.
- **Admin Panel**: Secure dashboard to upload worker data (JSON) and CVs (PDF).

## Tech Stack

- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **PDF Parsing**: PDF.js
- **Storage**: IndexedDB (idb-keyval)

## Local Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example`.
4.  Start the development server:
    ```bash
    npm run dev
    ```

## Supabase Setup (Production Database)

The app uses Supabase for storing worker data and images.

### 1. Create Supabase Project
1.  Sign up at [Supabase](https://supabase.com).
2.  Create a new project.

### 2. Create Workers Table
Run the following SQL in the Supabase SQL Editor:
```sql
create table workers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  worker_code text unique,
  name text,
  nationality text,
  age integer,
  religion text,
  marital_status text,
  experience text,
  skills jsonb default '[]'::jsonb,
  languages jsonb default '[]'::jsonb,
  portrait_image_url text,
  full_body_image_url text,
  work_experience jsonb default '[]'::jsonb,
  passport_number text,
  date_of_birth text,
  place_of_birth text,
  phone text,
  mobile text,
  raw_data jsonb
);

-- Enable RLS
alter table workers enable row level security;

-- Create Policies
create policy "Public can read workers" on workers for select using (true);
create policy "Public can insert workers" on workers for insert with check (true);
create policy "Public can update workers" on workers for update using (true);
create policy "Public can delete workers" on workers for delete using (true);
```

### 3. Create Storage Bucket
1.  Go to **Storage** in Supabase.
2.  Create a new bucket named `worker-images`.
3.  Set it to **Public**.
4.  Add a policy to allow public access:
    - `SELECT`: `true`
    - `INSERT/UPDATE/DELETE`: `true` (Or restricted to authenticated if you add auth later).

## Zoho Photo Importer (High-Quality)

The app includes a local script to import high-resolution portraits from Zoho Creator using your browser cookies (bypassing CORS).

### 1. Database Setup
Run this SQL in Supabase to add tracking columns:
```sql
alter table public.workers
add column if not exists photo_import_status text default 'pending',
add column if not exists photo_import_error text,
add column if not exists photo_imported_at timestamptz,
add column if not exists zoho_photo_path text,
add column if not exists zoho_record_id text;
```

### 2. Local Environment Setup
Create a file named `.env.local` in the project root on your Mac:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
ZOHO_COOKIE=your-full-cookie-string
ZOHO_CREATOR_REPORT_BASE=https://creatorapp.zoho.com/eitmam/eitmam-erp/report/All_Workers
ZOHO_DIGEST_VALUE=eyJsYW5ndWFnZSI6ImVuIn0=
WATCH_INTERVAL_SECONDS=30
```

### 3. Run the Importer
- **One-time import** (pending only):
  ```bash
  npm run import:zoho-photos
  ```
- **Watch mode** (automatically imports new uploads):
  ```bash
  npm run watch:zoho-photos
  ```
- **Retry failed** (useful if cookie expired):
  ```bash
  RETRY_FAILED=true npm run import:zoho-photos
  ```

## Vercel Deployment (Production)

The app is ready for deployment on Vercel as a static site.

### 1. Push to GitHub
Create a new repository on GitHub and push your code.

### 2. Connect to Vercel
1.  Go to [Vercel](https://vercel.com) and create a new project.
2.  Import your GitHub repository.
3.  Vercel should automatically detect **Vite** as the framework.

### 3. Configure Environment Variables
In the Vercel project settings, add the following Environment Variables (found in `.env.example`):
- `VITE_WHATSAPP_NUMBER`: The office WhatsApp number (e.g., `+971508368230`).
- `VITE_ADMIN_PASSWORD`: Password for the `/admin-tadbeer` page.
- `VITE_OFFICE_NAME`: Agency branding name.
- `VITE_OFFICE_LOCATION`: Office location/number.
- `VITE_OFFICE_MANAGER`: Manager's name.
- `VITE_ZOHO_CREATOR_BASE_URL`: Base URL for Zoho Creator reports (e.g. `https://creatorapp.zoho.com/eitmam/eitmam-erp/report/All_Workers`).
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

### 6. Configure Secret Variables (Critical)
The following variable is **required** for high-quality Zoho image import and must be added **only** in Vercel project settings (it is NOT prefixed with `VITE_`):
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase **Service Role** key (found in Supabase Dashboard > Settings > API). **DO NOT** commit this key to GitHub or use it in frontend code.

### 7. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5. Deploy
Click **Deploy**. Your app will be live on a `*.vercel.app` domain.

## Admin Instructions

1.  Navigate to `/admin-tadbeer`.
2.  Login with your `VITE_ADMIN_PASSWORD`.
3.  Upload the worker JSON file.
4.  (Optional) Upload the combined PDF file to extract worker photos and experience.
5.  Save settings to update the office WhatsApp number.
