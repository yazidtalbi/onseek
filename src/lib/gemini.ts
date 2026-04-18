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
  "Other/General"
];

export async function extractRequestData(userText: string) {
  console.log("Starting extraction with text length:", userText.length);
  
  try {
    const ai = getGenAI();
    // Use the model ID found in the availability listing
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
    console.log("Model initialized: gemini-flash-latest");

  const prompt = `
# Role
You are an expert data extractor for Onseek, a premium marketplace. Your task is to transform a user's natural language intent into a structured JSON object.

# Logic Rules
1. **Title**: Professional, high-end title summarizing the core need. 
   - If they want an item: "Vintage Rolex Submariner"
   - If they want a service/project: "Apartment Renovation & Interior Design"
   - Avoid "I am looking for" or "Request for". Capitalize properly. Max 4-6 words.
2. **Category**: Match to the closest one from the list below. If no category fits well, use "Other/General".
3. **Budget**: Extract numerical value. 
   - If they say "sixty thousand dollars", return 60000. 
   - Remove currency symbols and commas. 
   - If vague or missing, return "Negotiable".
4. **Condition**: Match to: [New, Used, Either]. Default to "Either".
5. **Preferences (INCLUDES)**: Extract EVERY specific requirement, capability, feature, or specification the user mentions (e.g., "120 square meter", "Minimalist modern", "Open-plan kitchen"). Each one must be a concise string in the \`preferences\` array.
6. **Dealbreakers (EXCLUDES)**: Identify negative constraints or exclusions (e.g., "avoid rounded furniture"). 
7. **Description**: A professional, structured summary of the request.
8. **Instructions**: If the user's text includes instructions for the provider (like "Please provide a portfolio"), IGNORE them in the extraction fields but you may summarize the need for them in the description.

# Categories
[${CATEGORIES.join(", ")}]

# Input
User intent: "${userText}"

# Output Requirement
Return ONLY a valid JSON object. Do not include markdown formatting or any other text.
{
  "title": string,
  "category": string,
  "budget": number | "Negotiable",
  "condition": "New" | "Used" | "Either",
  "preferences": string[],
  "dealbreakers": string[],
  "description": string
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
    const text = response.text();
    console.log("Raw response from Gemini received:", text.substring(0, 100) + "...");
    
    try {
      // More robust JSON extraction: find the first { and last }
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      const cleanText = jsonMatch[0];
      const parsed = JSON.parse(cleanText);
      console.log("Successfully parsed JSON data with keys:", Object.keys(parsed));
      
      // Normalize common key variations from AI
      const normalized = {
        title: (parsed.title || parsed.Title || parsed.request_title || "").trim(),
        category: (parsed.category || parsed.Category || "Other/General").trim(),
        budget: parsed.budget || parsed.Budget || "Negotiable",
        condition: parsed.condition || parsed.Condition || "Either",
        preferences: parsed.preferences || parsed.Preferences || parsed.includes || [],
        dealbreakers: parsed.dealbreakers || parsed.Dealbreakers || parsed.excludes || [],
        description: parsed.description || parsed.Description || ""
      };

      // Ensure title is not empty and is sufficiently descriptive
      if (!normalized.title || normalized.title.length < 3) {
        // Fallback: Use the first sentence of user text, cleaned up
        const firstSentence = userText.split(/[.!?]/)[0]
          .replace(/I am looking for/i, "")
          .replace(/I want/i, "")
          .trim();
        normalized.title = (firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1)).substring(0, 50);
        if (normalized.title.length < 5) normalized.title = "New Request";
      }
      
      // Ensure compatibility with frontend ExtractedData interface
      return {
        ...normalized,
        budget: String(normalized.budget),
        original_text: userText
      };
    } catch (error) {
      console.error("Failed to parse Gemini response JSON. Raw text:", text);
      throw new Error("Failed to extract structured data from input");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
