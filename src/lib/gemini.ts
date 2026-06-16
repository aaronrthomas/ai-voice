import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will be mocked.");
}

const genAI = new GoogleGenerativeAI(apiKey || "mock-key");

// Fast model for question generation and feedback
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.8,
    topP: 0.9,
  },
});

// More capable model for detailed feedback
export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
    topP: 0.8,
  },
});

export default genAI;
