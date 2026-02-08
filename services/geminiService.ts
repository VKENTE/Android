
import { GoogleGenAI } from "@google/genai";
import { SearchResult, ToiletLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function findToilets(
  lat?: number,
  lng?: number,
  searchQuery?: string
): Promise<SearchResult> {
  // Using 'gemini-2.5-flash' as it is the standard for Google Maps grounding in the 2.5 series.
  const model = "gemini-2.5-flash";
  
  const prompt = searchQuery 
    ? `Finden Sie öffentliche Toiletten in der Nähe von "${searchQuery}". Geben Sie Details zu Sauberkeit, Barrierefreiheit und Öffnungszeiten an, falls verfügbar.`
    : `Finden Sie alle öffentlichen Toiletten in meiner unmittelbaren Nähe. Geben Sie Details zu Sauberkeit, Barrierefreiheit und Öffnungszeiten an, falls verfügbar.`;

  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  // If user location is provided, include it in toolConfig for grounding as per documentation.
  if (lat !== undefined && lng !== undefined) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: lat,
          longitude: lng,
        },
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const text = response.text || "Ich konnte keine Informationen finden.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const locations: ToiletLocation[] = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri,
        snippets: chunk.maps.placeAnswerSources?.map((s: any) => s.reviewSnippet).filter(Boolean) || [],
      }));

    return { text, locations };
  } catch (error: any) {
    console.error("Error fetching toilets:", error);
    // If we get a 404, it might be the model name or the specific grounding tool availability in this region.
    if (error.message?.includes("404") || error.status === "NOT_FOUND") {
        throw new Error("Der Dienst ist zur Zeit nicht verfügbar oder der Standort wird nicht unterstützt (Model: " + model + ").");
    }
    throw new Error("Fehler bei der Suche nach Toiletten. Bitte versuchen Sie es später erneut.");
  }
}
