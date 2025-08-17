import { GoogleGenAI, Type } from "@google/genai";
import type { MCQ, ExtractionResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CORS_PROXIES = [
    // Reliable general-purpose proxies
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors.eu.org/',
    
    // Proxies with different structures
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-proxy.htmldriven.com/?url=',
    
    // More options to try
    'https://cors.zme.ink/',
    'https://cors-proxy.fringe.zone/',
    'https://cors-anywhere.herokuapp.com/', // Often rate-limited, so placed lower in priority
];

export class ProxyBlockedError extends Error {
    public readonly url: string;
    constructor(message: string, url: string) {
        super(message);
        this.name = 'ProxyBlockedError';
        this.url = url;
    }
}

export async function fetchHtmlWithFallbacks(url: string): Promise<string> {
    let lastError: Error | null = null;

    // Shuffle proxies to rotate them for each request
    const shuffledProxies = [...CORS_PROXIES];
    for (let i = shuffledProxies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledProxies[i], shuffledProxies[j]] = [shuffledProxies[j], shuffledProxies[i]];
    }

    for (const proxy of shuffledProxies) {
        const proxyUrl = proxy + encodeURIComponent(url);
        try {
            const response = await fetch(proxyUrl, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' } // Some proxies require this
            });
            if (!response.ok) {
                throw new Error(`Proxy responded with status ${response.status}`);
            }
            const text = await response.text();
            if (text && !text.includes("The page is temporarily unavailable")) { // Specific check for some proxies' error pages
                return text;
            }
            throw new Error('Proxy returned empty or error content.');
        } catch (error) {
            console.warn(`Attempt with proxy ${proxy.split('/')[2] || proxy} failed:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }
    
    const errorMessage = `The target website appears to be blocking automated requests. (Last error: ${lastError?.message}). This is a common issue.`;
    throw new ProxyBlockedError(errorMessage, url);
}

const extractionSchema = {
  type: Type.OBJECT,
  properties: {
    mcqs: {
      type: Type.ARRAY,
      description: "An array of all the multiple choice questions found on the page.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: 'The full text of the question. Preserve any formatting like subscripts or superscripts if possible (e.g., using HTML tags or simple text representation like x^2).',
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of strings, with each string representing one of the multiple-choice options (e.g., ["Option A", "Option B", "Option C", "Option D"]).',
          },
          correctAnswer: {
            type: Type.STRING,
            description: 'The exact text of the correct answer from the provided options list.',
          },
          examName: {
            type: Type.STRING,
            description: 'The name of the examination or context usually found below the question text (e.g., "UPSC IAS, 2012"). If no exam name is present for a question, return an empty string.',
          },
          imageUrl: {
            type: Type.STRING,
            description: 'The absolute URL of an image relevant to the question, like a diagram or figure. Ignore logos, icons, and placeholder images. Return null if no suitable image is found.',
          }
        },
        required: ['question', 'options', 'correctAnswer', 'examName'],
      },
    },
    nextUrl: {
      type: Type.STRING,
      description: 'The absolute URL for the "Next" or "Next Page" button, if one exists on the page. If there is no next button, return null.',
    }
  },
  required: ['mcqs']
};


export async function extractDataFromHtml(htmlContent: string, baseUrl?: string): Promise<ExtractionResult> {
  try {
    const prompt = `From the provided HTML, extract all physics MCQs, including any relevant images and the exam name for each, and the URL for the next page. ${
      baseUrl
        ? `IMPORTANT: The base URL for this page is ${baseUrl}. You MUST convert any relative image URLs (like '/path/image.png' or 'image.png') into absolute URLs using this base URL.`
        : ''
    } \n\nHTML:\n${htmlContent}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert web scraper. Your task is to parse HTML to extract Multiple-Choice Questions (MCQs), their source exam, relevant images, and the next page URL. Adhere strictly to the JSON schema provided.",
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: 2048,
        },
      },
    });

    const jsonText = response.text?.trim();

    if (!jsonText) {
        const finishReason = response.candidates?.[0]?.finishReason;
        const blockReason = response.promptFeedback?.blockReason;
        let errorMessage = "API returned an empty response.";
        if (blockReason) {
            errorMessage = `Request was blocked by the API. Reason: ${blockReason}.`;
        } else if (finishReason && finishReason !== 'STOP') {
            errorMessage = `The model stopped generating for an unexpected reason: ${finishReason}.`;
        }
        throw new Error(errorMessage);
    }

    const parsedData = JSON.parse(jsonText);
    
    if (parsedData && Array.isArray(parsedData.mcqs)) {
        return {
            mcqs: parsedData.mcqs,
            nextUrl: parsedData.nextUrl || null
        };
    } else {
        console.error("Parsed data does not match ExtractionResult structure:", parsedData);
        throw new Error("Received malformed data from the API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the API response as JSON. The data might be malformed.");
    }
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to communicate with the AI model. Please check the console for more details.");
  }
}