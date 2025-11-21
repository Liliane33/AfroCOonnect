import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Safe fallback for compilation

// Initialize only if key exists to prevent crash on load
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const enhanceAdDescription = async (
  draftText: string,
  category: string,
  title: string
): Promise<string> => {
  if (!ai) {
    console.warn("API Key missing");
    return draftText; // Return original if no API key
  }

  try {
    const prompt = `
      Tu es un expert en marketing pour une plateforme de services entre particuliers (type LeBonCoin ou Vinted).
      L'utilisateur rédige une annonce dans la catégorie "${category}" avec le titre "${title}".
      
      Voici son brouillon actuel : "${draftText}"
      
      Tâche : Réécris et améliore cette description pour qu'elle soit plus attrayante, claire, et professionnelle.
      Ajoute des emojis pertinents. Garde le ton amical mais sérieux.
      Ne mets pas de texte d'introduction ("Voici la description..."), donne juste le texte final.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || draftText;
  } catch (error) {
    console.error("Error enhancing description:", error);
    return draftText;
  }
};
