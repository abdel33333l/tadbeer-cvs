import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { imageUrls, workerCode, type = "portrait" } = req.body || {};

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ success: false, error: "Missing imageUrls" });
    }

    if (!workerCode) {
      return res.status(400).json({ success: false, error: "Missing workerCode" });
    }

    const safeWorkerCode = String(workerCode).replace(/[^a-zA-Z0-9_-]/g, "");
    const safeType = String(type).replace(/[^a-zA-Z0-9_-]/g, "");

    let lastError = "";

    for (const imageUrl of imageUrls) {
      try {
        console.log(`Server-side fetch attempt: ${imageUrl}`);
        const response = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        if (!response.ok) {
          lastError = `Zoho fetch failed ${response.status} for URL: ${imageUrl}`;
          console.warn(lastError);
          continue;
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.startsWith("image/")) {
          lastError = `Not an image: ${contentType} for URL: ${imageUrl}`;
          console.warn(lastError);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension =
          contentType.includes("png") ? "png" :
          contentType.includes("webp") ? "webp" :
          "jpg";

        const filePath = `${safeWorkerCode}/${safeType}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("worker-images")
          .upload(filePath, buffer, {
            contentType,
            cacheControl: "31536000",
            upsert: true,
          });

        if (uploadError) {
          lastError = `Supabase upload error: ${uploadError.message}`;
          console.error(lastError);
          continue;
        }

        const { data } = supabase.storage
          .from("worker-images")
          .getPublicUrl(filePath);

        console.log(`Successfully imported Zoho image to: ${data.publicUrl}`);
        return res.status(200).json({
          success: true,
          publicUrl: data.publicUrl,
        });

      } catch (error) {
        lastError = error.message;
        console.error(`Error processing candidate ${imageUrl}:`, error);
      }
    }

    return res.status(400).json({
      success: false,
      error: lastError || "All Zoho image URLs failed",
    });

  } catch (error) {
    console.error("Critical API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
