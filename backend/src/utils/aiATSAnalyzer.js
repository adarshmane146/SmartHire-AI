import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResumeWithAI(resumeText) {

  try {

    const safeText = resumeText.substring(0, 8000);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8000
      }
    });

  const prompt = `
You are an ATS resume analysis system used by recruiters.

Analyze the resume and return the result EXACTLY in this format:

ATS Score: <number>/100
Reason: <short explanation>

Strengths:
- point
- point
- point

Missing Keywords:
- keyword
- keyword
- keyword

Improvements:
- suggestion
- suggestion
- suggestion

Important rules:
- Always include ALL sections.
- Each section must contain at least 3 items.
- Keep response under 150 words.

Resume:
${safeText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    return text;

  } catch (error) {

    console.error("Gemini AI Error:", error.message);

    return "AI analysis unavailable";

  }

}