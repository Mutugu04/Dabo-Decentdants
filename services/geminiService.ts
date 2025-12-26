
import { GoogleGenAI } from "@google/genai";

// Fixed: Correct initialization using named parameter and process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMemberBio = async (name: string, title?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a brief, dignified historical biography (max 100 words) for a prominent member of the Ibrahim Dabo family of Kano named ${name}${title ? ` with the title ${title}` : ''}. If historical data is scarce, provide a respectful generic placeholder bio for a Fulani noble.`,
    });
    // Fixed: Using .text property directly as per latest SDK guidelines
    return response.text;
  } catch (error) {
    console.error("Error fetching bio:", error);
    return "Historical details are being researched for this distinguished member of the Ibrahim Dabo lineage.";
  }
};
