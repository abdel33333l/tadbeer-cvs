import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    // Always set content type to JSON
    res.setHeader("Content-Type", "application/json");

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return res.status(500).json({
        success: false,
        error: "Missing server Supabase environment variables",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Support both stringified and object bodies
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { imageUrls, workerCode, type = "portrait" } = body || {};

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing imageUrls",
      });
    }

    if (!workerCode) {
      return res.status(400).json({
        success: false,
        error: "Missing workerCode",
      });
    }

    const safeWorkerCode = String(workerCode).replace(/[^a-zA-Z0-9_-]/g, "");
    const safeType = String(type).replace(/[^a-zA-Z0-9_-]/g, "");

    let lastError = "";

    for (const imageUrl of imageUrls) {
      try {
        console.log("Trying Zoho image URL:", imageUrl);

        const response = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          lastError = `Zoho fetch failed: ${response.status}`;
          console.warn(lastError);
          continue;
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.startsWith("image/")) {
          lastError = `Zoho did not return image. Content-Type: ${contentType}`;
          console.warn(lastError);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension =
          contentType.includes("png") ? "png" :
          contentType.includes("webp") ? "webp" :
          "jpg";

        const filePath = `${safeWorkerCode}/${safeType}-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("worker-images")
          .upload(filePath, buffer, {
            contentType,
            cacheControl: "31536000",
            upsert: true,
          });

        if (uploadError) {
          lastError = uploadError.message;
          console.error("Supabase storage upload error:", uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from("worker-images")
          .getPublicUrl(filePath);

        return res.status(200).json({
          success: true,
          publicUrl: data.publicUrl,
        });
      } catch (error) {
        lastError = error.message;
        console.error("Zoho candidate failed:", error);
      }
    }

    return res.status(400).json({
      success: false,
      error: lastError || "All Zoho image URLs failed",
    });
  } catch (error) {
    console.error("Import Zoho image API fatal error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
