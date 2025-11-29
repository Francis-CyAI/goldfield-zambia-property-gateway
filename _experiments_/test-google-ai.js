// test-google-ai.js
import { GoogleGenAI } from "@google/genai";

// Read API key from environment
const apiKey = process.env.VITE_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: Please set your VITE_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY environment variable.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function runTest() {
  try {
    console.log("Sending request to Gemini 2.5 Flash...\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ current, supported model
      contents: "Say hello in one short sentence.",
    });

    console.log("✅ SUCCESS! Your Google AI API key works.\n");
    console.log("Response from model:");
    console.log("----------------------");
    console.log(response.text);
    console.log("----------------------\n");
  } catch (e) {
    console.error("❌ API Error");
    console.error("name   :", e.name);
    console.error("message:", e.message);
    if (e.status) console.error("status :", e.status);
  }
}

runTest();
