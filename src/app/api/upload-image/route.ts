import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];
    const requestId = formData.get("requestId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images allowed` }, { status: 400 });
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 5MB limit` }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `File ${file.name} is not an image` }, { status: 400 });
      }
    }

    // If requestId is provided, check ownership
    if (requestId) {
      const { data: request } = await supabase
        .from("requests")
        .select("user_id")
        .eq("id", requestId)
        .single();

      if (!request || request.user_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Check existing images count
      const { count: existingCount } = await supabase
        .from("request_images")
        .select("id", { count: "exact", head: true })
        .eq("request_id", requestId);

      if ((existingCount || 0) + files.length > MAX_IMAGES) {
        return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images per request` }, { status: 400 });
      }
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Optimize image: resize to max 1200px width, convert to WebP, quality 85
      const optimized = await sharp(buffer)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("request-images")
        .upload(fileName, optimized, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Provide more specific error message
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("The resource was not found")) {
          return NextResponse.json({ 
            error: "Storage bucket 'request-images' not found. Please create it in Supabase Storage." 
          }, { status: 500 });
        }
        return NextResponse.json({ 
          error: uploadError.message || "Failed to upload image" 
        }, { status: 500 });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("request-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);

      // If requestId is provided, save to database
      if (requestId) {
        const { error: dbError } = await supabase
          .from("request_images")
          .insert({
            request_id: requestId,
            image_url: publicUrl,
            image_order: i,
          });

        if (dbError) {
          console.error("Database error:", dbError);
          // Continue with other images even if one fails
        }
      }
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Image upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process images";
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { status: 500 });
  }
}

