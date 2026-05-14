import { GoogleGenAI, Type } from "@google/genai";
import { dataService } from "./dataService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface CommentaryResponse {
  event: string;
  score: string;
  commentary: string;
  key_stat: string;
}

export const aiService = {
  async generateCommentary(match: any, newScore: any, eventType: string = "event"): Promise<CommentaryResponse | null> {
    try {
      const prompt = `
        Match: ${match.title} (${match.sport})
        New Score Data: ${JSON.stringify(newScore)}
        Event Type: ${eventType}
        Generate a professional, engaging sports commentary for the current match state.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional sports commentator for Rimon Sports Live. Provide structured JSON output for the latest match event. Style: Energetic, Premium, Emotional.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              event: { type: Type.STRING },
              score: { type: Type.STRING },
              commentary: { type: Type.STRING },
              key_stat: { type: Type.STRING }
            },
            required: ["event", "score", "commentary", "key_stat"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text.trim());
        // Save to Firestore automatically
        let gameTime = "0'";
        if (match.sport === 'cricket') {
          const s = newScore as any;
          gameTime = `${s.team1.overs}.${s.team1.balls}`;
        } else if (match.sport === 'football') {
          gameTime = `${newScore.time}'`;
        }

        await dataService.addCommentary(match.id, data.commentary, 'ai', gameTime);
        return data;
      }
      return null;
    } catch (error) {
       console.error("AI Commentary Error:", error);
       return null;
    }
  },

  async generateCricketCommentary(ballData: {
    runs: number;
    wicket?: string;
    extras?: number;
    batsmanName: string;
    bowlerName: string;
    totalScore: string;
    oversCount: string;
    partnership?: string;
  }): Promise<CommentaryResponse | null> {
    try {
      const prompt = `
        Analyze the following ball data and provide a structured scoreboard update and professional commentary.
        
        Ball Data:
        - Runs scored: ${ballData.runs}
        - Wicket type: ${ballData.wicket || 'None'}
        - Extras: ${ballData.extras || 0}
        - Batsman: ${ballData.batsmanName}
        - Bowler: ${ballData.bowlerName}
        - Current Total: ${ballData.totalScore}
        - Current Overs: ${ballData.oversCount}
        - Partnership: ${ballData.partnership || 'N/A'}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `
            You are a Real-time Cricket Scoring and Commentary Engine. Your goal is to process ball-by-ball raw data and convert it into a structured scoreboard update and a professional, engaging live commentary.
            Tone & Style: Energetic, professional, and observant.
          `,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              event: { type: Type.STRING },
              score: { type: Type.STRING },
              commentary: { type: Type.STRING },
              key_stat: { type: Type.STRING }
            },
            required: ["event", "score", "commentary", "key_stat"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text.trim());
      }
      return null;
    } catch (error) {
      console.error("AI Cricket Commentary Error:", error);
      return null;
    }
  }
};
