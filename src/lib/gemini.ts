import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENAI_API_KEY is not defined");
    // Explicitly use v1 to avoid v1beta issues
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export const CATEGORIES = [
  "Tech & Electronics",
  "Grocery & Food",
  "Fashion & Accessories",
  "Health & Beauty",
  "Family & Kids",
  "Home & Living",
  "Garden & DIY",
  "Automotive",
  "Culture & Entertainment",
  "Sports & Outdoors",
  "Mobile & Internet Plans",
  "Finance & Insurance",
  "Services",
  "Travel",
  "Gaming & Consoles",
  "Other"
];

export async function extractRequestData(userText: string) {
  console.log("Starting extraction with text length:", userText.length);
  
  try {
    const ai = getGenAI();
    // Use the model ID found in the availability listing
    const model = ai.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    console.log("Model initialized: gemini-3.1-flash-lite-preview");

  const prompt = `
# Role
You are the Onseek Extraction Engine. Your goal is to transform raw user intent into a structured "Demand" artifact for our request-first marketplace.

# Logic Rules
1. **Title**: Create a sharp, professional 5-8 word title. (Example: "Refurbished Steam Deck OLED 512GB")
2. **Category**: Match to the closest one from this list: [${CATEGORIES.join(", ")}].
3. **Budget**: Extract numerical value and currency. If vague, use "Negotiable".
4. **Condition**: Match to: [New, Used, Either]. Default to "Either" if not specified.
5. **Preferences**: (Nice-to-haves) Identify phrases like "ideally," "would love," "if possible."
6. **Dealbreakers**: (Strict Requirements) Identify phrases like "must," "only," "required," "needs to be."
7. **Tone**: Minimalist and analytical. 

# Input
User text: "${userText}"

# Output Requirement
Return ONLY a JSON object with the following fields:
- title: string
- category: string
- budget: string
- condition: string ("New", "Used", or "Either")
- preferences: string[]
- dealbreakers: string[]
- original_text: string (the input text)
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
    const text = response.text();
    console.log("Raw response from Gemini received:", text.substring(0, 100) + "...");
    
    try {
      // Basic cleanup of markdown code blocks if present
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);
      console.log("Successfully parsed JSON data");
      return parsed;
    } catch (error) {
      console.error("Failed to parse Gemini response JSON:", text);
      throw new Error("Failed to extract structured data from input");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
