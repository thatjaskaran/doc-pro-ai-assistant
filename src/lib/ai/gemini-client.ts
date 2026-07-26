import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

export const gemini = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;