const { extractRequestData } = require("./src/lib/gemini");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const userText = "I am looking for a professional architect and interior designer to help me transform a 120 square meter shell-and-core apartment into a minimalist modern living space that focuses on a high-contrast aesthetic and maximum functional utility. The project requires a complete spatial redesign including the demolition of two non-load-bearing walls to create an open-plan kitchen and living area that prioritizes natural light and sharp architectural lines. I want the color palette to be strictly limited to deep charcoals, off-whites, and natural wood textures, avoiding any rounded or bubbly furniture in favor of a grid-based layout with thin-profile steel fixtures and custom cabinetry that hides all appliances from view. For the lighting, I require a smart system integrated into recessed ceiling tracks that can be controlled via a mobile app to create different atmospheric presets for work and relaxation. The bathroom should be treated as a wet room with slate tiles and a walk-in shower featuring a matte black rainfall head and concealed drainage. I am also looking for the sourcing of specific furniture pieces such as a large modular sofa in a heavy-knit grey fabric and a solid oak dining table that can double as a conference area. My total budget for the design, materials, and labor is sixty thousand dollars and I expect the project to be completed within four months of the initial contract signing. Please provide a detailed response that includes your previous portfolio of similar minimalist projects, a preliminary timeline for the three phases of construction, and a breakdown of how you handle material procurement and contractor supervision to ensure the final result matches the initial 3D renders.";

async function run() {
  try {
    const data = await extractRequestData(userText);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

run();
