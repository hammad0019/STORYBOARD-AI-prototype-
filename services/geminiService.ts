import { GoogleGenAI, Type, Schema, GenerateContentResponse, Content } from "@google/genai";
import { ScriptScene } from '../types';

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

declare const puter: any;

// --- Script Analysis ---

export const analyzeScript = async (scriptText: string): Promise<ScriptScene[]> => {
  if (!apiKey) throw new Error("API Key not found");

  const systemInstruction = `You are an expert storyboard artist and director. 
  Your task is to analyze a movie or video script and break it down into key visual frames.
  For each frame, extract the scene number (if implicit, count up), a short narrative description, and a highly detailed "visual_prompt" optimized for an AI image generator.
  The visual prompt must describe the composition, lighting, camera angle, subject, and style.
  Return the result as a JSON array.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        scene_number: { type: Type.INTEGER },
        description: { type: Type.STRING },
        visual_prompt: { type: Type.STRING },
      },
      required: ["scene_number", "description", "visual_prompt"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: scriptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    
    // Add client-side IDs and state
    return parsed.map((item: any, index: number) => ({
      id: `scene-${index}-${Date.now()}`,
      scene_number: item.scene_number,
      description: item.description,
      visual_prompt: item.visual_prompt,
      is_generating: false,
    }));

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// --- Image Generation (Hybrid Strategy) ---

const generateWithPuter = async (prompt: string): Promise<string | null> => {
  try {
    // Using Puter.js as fallback/unlimited generator
    const imageElement = await puter.ai.txt2img(prompt);
    if (imageElement && imageElement.src) {
      return imageElement.src;
    }
    return null;
  } catch (error) {
    console.error("Puter generation failed:", error);
    throw error;
  }
};

const generateWithGemini = async (prompt: string): Promise<string | null> => {
  if (!apiKey) throw new Error("API Key missing");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-image',
    contents: {
      parts: [{ text: prompt }],
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  // Hybrid Strategy:
  // 1. Try Gemini 2.5 Flash Image (Fastest, ~2-4s).
  // 2. If Rate Limit (429) is hit, fallback to Puter.js (Slower but unlimited).
  
  try {
    return await generateWithGemini(prompt);
  } catch (error: any) {
    const errString = JSON.stringify(error) + (error?.message || '');
    
    // Check for rate limit or quota errors
    if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED') || errString.includes('quota')) {
      console.warn(`Gemini rate limit hit for prompt "${prompt.substring(0, 20)}...". Falling back to Puter.js.`);
      return await generateWithPuter(prompt);
    }
    
    // Check for safety filter refusal (Gemini can be strict) - optional fallback
    if (errString.includes('SAFETY') || errString.includes('blocked')) {
       console.warn(`Gemini blocked prompt safely. Trying Puter.`);
       return await generateWithPuter(prompt);
    }

    // If it's a real network/API error that isn't rate limit, we might still want to try fallback?
    // Let's be aggressive and try fallback for most errors to ensure user gets an image.
    console.warn("Gemini generation failed with error, trying fallback:", error);
    return await generateWithPuter(prompt);
  }
};

// --- Chat Assistant ---

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, context?: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const systemInstruction = `You are StoryBoard AI Assistant. You help users refine their scripts, suggest camera angles, and improve visual prompts. 
  ${context ? `Current Context: ${context}` : ''}
  Keep answers concise and helpful for visual storytelling.`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
      },
      // Ensure strict mapping to Content objects
      history: history.map(h => ({
        role: h.role,
        parts: h.parts.map(p => ({ text: p.text }))
      }))
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage
    });
    
    return result.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("Chat failed:", error);
    const msg = error?.message || "Unknown error";
    if (msg.includes("429")) return "I'm receiving too many requests right now. Please try again in a moment.";
    return `Error: ${msg.substring(0, 50)}...`;
  }
};