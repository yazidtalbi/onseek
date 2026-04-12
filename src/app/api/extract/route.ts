import { NextResponse } from "next/server";
import { extractRequestData } from "@/lib/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const extractedData = await extractRequestData(text);
    console.log("Extraction successful");

    return NextResponse.json(extractedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Full Extraction Error Stack:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
