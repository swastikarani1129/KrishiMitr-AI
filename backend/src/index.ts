import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { startFlowServer } from '@genkit-ai/express';
import dotenv from 'dotenv';

// Load environment variables (.env file)
dotenv.config();

// Initialize the Genkit SDK with the Google GenAI plugin
const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash', // Default model for flows
});

// 1. Voice Transaction Parser Flow
export const voiceParserFlow = ai.defineFlow(
  {
    name: 'voiceParserFlow',
    inputSchema: z.object({
      text: z.string().describe('The raw text transcribed from speech to extract transaction details from.')
    }),
    outputSchema: z.object({
      amount: z.number().describe('The parsed transaction amount in Rupees.'),
      type: z.enum(['expense', 'income']).describe('The transaction type: expense (for costs like seed/fertilizer/labor) or income (for sales).'),
      category: z.enum(['seed', 'fertilizer', 'labor', 'pesticides', 'fuel', 'sale', 'other']).describe('The closest category for the transaction.'),
      note: z.string().describe('Descriptive note about the transaction, maintaining details.')
    }),
  },
  async (input) => {
    const response = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      system: `You are an AI financial extractor for a smart farmer assistant app (KishanMitr). 
      Your task is to parse a text transaction logged in English or Hindi (written in Devnagari or Hinglish) and return structured values.
      
      Rules:
      1. Identify the 'amount' as a positive number. Look for words like 'rupees', 'rs', 'रुपये', 'रुपया', 'हजार', 'सौ'.
      2. Set the 'type' to:
         - 'income' if the text describes selling crops, harvest sales, or earning money (e.g. 'sold', 'sale', 'बेचा', 'मंडी में दिया', 'बिक्री', 'कमाई').
         - 'expense' for all costs like seeds, fertilizers, tractor plowing, fuel, sprays, worker labor.
      3. Set the 'category' to:
         - 'seed' (बीज)
         - 'fertilizer' (खाद, यूरिया, DAP)
         - 'labor' (मजदूर, मजदूरी)
         - 'pesticides' (छिड़काव, स्प्रे, कीटनाशक, दवाई)
         - 'fuel' (डीजल, ट्रैक्टर जुताई, plowing)
         - 'sale' (for crop sales/income)
         - 'other' (if it doesn't fit any).
      4. Set the 'note' to a clean, descriptive summary. In Hindi or English depending on input preference.`,
      prompt: `Extract transaction from this phrase: "${input.text}"`,
      config: {
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    // Genkit auto-coerces output matching outputSchema!
    const result = response.output;
    if (!result) {
      throw new Error('AI failed to parse transaction output.');
    }

    return result;
  }
);

// 2. Crop Disease Vision Diagnostician Flow
export const diseaseDiagnosisFlow = ai.defineFlow(
  {
    name: 'diseaseDiagnosisFlow',
    inputSchema: z.object({
      imageBase64: z.string().describe('The leaf crop image base64 data string (e.g. data:image/jpeg;base64,...)')
    }),
    outputSchema: z.object({
      diseaseName: z.string().describe('Likely diagnosed crop disease name.'),
      confidence: z.number().min(0).max(100).describe('Confidence score percentage (0-100).'),
      symptoms: z.string().describe('Identified symptoms on leaf surfaces.'),
      treatment: z.string().describe('Recommended chemical or organic cure sprays.'),
      prevention: z.string().describe('Tips to prevent recurrence in the future.')
    }),
  },
  async (input) => {
    // Extract base64 details to format media parts correctly
    const base64Data = input.imageBase64.split(';base64,').pop() || '';
    const mimeType = input.imageBase64.split(';base64,')[0].split('data:').pop() || 'image/jpeg';

    const response = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      system: `You are an expert crop pathologist AI vision agent for KishanMitr. 
      Analyze the leaf image provided. Identify the crop, diagnose the disease, and return structured recommendations.
      If the leaf is healthy, return diseaseName as "Healthy Leaf", confidence 99%, and state no treatment is required.`,
      prompt: [
        {
          media: {
            url: `data:${mimeType};base64,${base64Data}`,
            contentType: mimeType
          }
        },
        {
          text: 'Diagnose the plant leaf disease. Identify symptoms, organic/chemical treatment options, and crop care prevention strategies.'
        }
      ]
    });

    const result = response.output;
    if (!result) {
      throw new Error('AI vision agent failed to diagnose leaf image.');
    }

    return result;
  }
);

// Start the Genkit HTTP server to expose the flows
const port = parseInt(process.env.PORT || '3400', 10);
console.log(`Starting KishanMitr Genkit server on port ${port}...`);

startFlowServer({
  flows: [voiceParserFlow, diseaseDiagnosisFlow],
  port: port,
  cors: {
    origin: '*', // Allow connections from frontend React dev server
    methods: ['POST', 'GET', 'OPTIONS']
  }
});
