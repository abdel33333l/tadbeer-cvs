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

### 4. Build Settings
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
