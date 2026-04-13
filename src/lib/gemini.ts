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
You are the Onseek Extraction Engine. Your goal is to transform raw user intent into a structured "Demand" artifact.

# Logic Rules
1. **Title**: Professional, high-end title. If the user says "I'm looking for X", the title should be "X" (properly capitalized). Do NOT add redundant descriptive words if they are already implied (e.g., don't add "Laptop" if "MacBook Pro" is present).
2. **Category**: Match to the closest one from the list below.
3. **Budget**: Extract numerical value. If vague or missing, return "Negotiable".
4. **Condition**: Match to: [New, Used, Either]. Default to "Either".
5. **Preferences**: (Nice-to-haves) Attributes the user likes but hasn't strictly demanded. 
6. **Dealbreakers**: (STRICT Requirements) ONLY identify these if the user uses exclusionary or absolute language like "Must be", "No", "Not", "Only", "Strictly". If no such language is used, move attributes to Preferences or the Title.

# Categories
[${CATEGORIES.join(", ")}]

# Input
User intent: "${userText}"

# Output Requirement
Return ONLY a JSON object:
{
  "title": string,
  "category": string,
  "budget": number | "Negotiable",
  "condition": "New" | "Used" | "Either",
  "preferences": string[],
  "dealbreakers": string[],
  "description": string (A professional summary of the request)
}
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
