// lib/aiGenerator.ts - Con crittografia API Key
import { AIGenerationRequest, AIGeneratedAnnotation } from '@/types';

const OPENAI_API_KEY_STORAGE = 'memorium_openai_key';

// Crittografia Base64 (meglio di niente per localStorage)
function encryptKey(key: string): string {
  return btoa(key);
}

function decryptKey(encrypted: string): string {
  try {
    return atob(encrypted);
  } catch {
    return encrypted;
  }
}

export function saveAPIKey(key: string): void {
  const encrypted = encryptKey(key);
  localStorage.setItem(OPENAI_API_KEY_STORAGE, encrypted);
}

export function getAPIKey(): string | null {
  const encrypted = localStorage.getItem(OPENAI_API_KEY_STORAGE);
  if (!encrypted) return null;
  return decryptKey(encrypted);
}

export function clearAPIKey(): void {
  localStorage.removeItem(OPENAI_API_KEY_STORAGE);
}

export function isAIEnabled(): boolean {
  const key = getAPIKey();
  return key !== null && key.startsWith('sk-');
}

export async function generateAnnotations(
  request: AIGenerationRequest
): Promise<AIGeneratedAnnotation[]> {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('API Key OpenAI non configurata. Vai in Impostazioni per aggiungerla.');
  }

  const { notesText, targetCount, imagesCount, language = 'italiano' } = request;

  const systemPrompt = `Sei un esperto della tecnica dei loci (palazzo della memoria). 
Il tuo compito è aiutare l'utente a memorizzare informazioni creando immagini mentali vivide e memorabili.

L'utente ha un palazzo con ${imagesCount} stanze/ambienti. 
Devi generare esattamente ${targetCount} annotazioni distribuite equamente tra le stanze.

Per ogni annotazione, crea:
1. "description": Una breve frase che riassume il concetto da memorizzare (max 50 caratteri)
2. "note": Un'immagine mentale vivida, assurda, emotiva o comica che associa il concetto alla stanza (max 200 caratteri)
3. "imageIndex": L'indice della stanza (da 0 a ${imagesCount - 1}) dove posizionare l'annotazione

IMPORTANTE:
- Distribuisci le annotazioni equamente tra le stanze
- Crea immagini mentali MOLTO vivide, strane, assurde o emotive
- Associa sempre il concetto a elementi visivi della stanza
- Usa colori vividi, azioni drammatiche, dimensioni esagerate

Rispondi SOLO con un array JSON valido nel formato:
{"annotations": [{"description": "...", "note": "...", "imageIndex": 0}]}`;

  const userPrompt = `Testo da memorizzare:\n\n${notesText}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Errore API OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    const annotations: AIGeneratedAnnotation[] = parsed.annotations || [];

    return annotations.slice(0, targetCount).map((ann, index) => ({
      description: ann.description?.trim() || `Annotazione ${index + 1}`,
      note: ann.note?.trim() || '',
      imageIndex: Math.min(Math.max(0, ann.imageIndex || 0), imagesCount - 1),
    }));
  } catch (error) {
    console.error('Errore generazione AI:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Errore sconosciuto durante la generazione AI');
  }
}