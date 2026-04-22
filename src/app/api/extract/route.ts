import { NextResponse } from "next/server";
import { extractRequestData } from "@/lib/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const extractedData = await extractRequestData(text);
    console.log("Extraction successful");

    return NextResponse.json(extractedData);
  } catch (error: any) {
    const isQuotaError = error?.message?.toLowerCase().includes("quota") || 
                        error?.message?.includes("429");
    const isServiceUnavailable = error?.message?.includes("503") || 
                                error?.status === 503 || 
                                error?.message?.includes("Service Unavailable");
    
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Extraction Error:", errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: isQuotaError ? 429 : isServiceUnavailable ? 503 : 500 }
    );
  }
}
