import { GoogleGenAI } from "@google/genai";
import { Match, CricketScore, FootballScore, BadmintonScore } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  generateCommentary: async (match: Match, eventType: string, eventData: any) => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. AI commentary will be unavailable.");
      return "The stadium is buzzing, but technical difficulties have silenced our AI commentator for a moment!";
    }

    const systemInstruction = `
      You are a world-class, professional sports commentator for "Rimon Sports Live".
      Your style is energetic, premium, and emotionally engaging, similar to top-tier broadcasters on ESPN or Sky Sports.
      
      Match Information:
      Sport: ${match.sport}
      Title: ${match.title}
      Current Status: ${match.status}
      
      Score/Context:
      ${JSON.stringify(match.score)}
      
      Generate a short (1-2 sentences), punchy, and exciting commentary line for a ${eventType} event.
      Event Details: ${JSON.stringify(eventData)}
      
      Use specific player names if available in the event data.
      Make it feel real-time and authentic to the sport.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate commentary for a ${eventType} in this ${match.sport} match.`,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      return response.text?.trim() || "Unbelievable scenes here!";
    } catch (error) {
      console.error("Gemini Commentary Error:", error);
      return "A moment of pure brilliance that leaves everyone speechless!";
    }
  },

  generateMatchSummary: async (match: Match) => {
     if (!process.env.GEMINI_API_KEY) return "Match concluded.";

     const systemInstruction = `
      You are an expert sports analyst for Rimon Sports Live.
      Analyze the final match result and provide a professional, data-driven summary (maximum 3 sentences).
      Match: ${match.title} (${match.sport})
      Final Score: ${JSON.stringify(match.score)}
     `;

     try {
       const response = await ai.models.generateContent({
         model: "gemini-3-flash-preview",
         contents: "Provide a quick post-match analysis.",
         config: { systemInstruction }
       });
       return response.text?.trim();
     } catch (error) {
       return "That concludes a thrilling encounter here at Rimon Sports!";
     }
  }
};
