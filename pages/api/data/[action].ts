// pages/api/data/[action].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'palaces.json');

// Assicurati che la cartella data esista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Se il file non esiste, crealo vuoto
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ version: '2.0.0', palaces: [] }, null, 2)
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'load':
        // Carica i dati dal file
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsedData = JSON.parse(data);
        return res.status(200).json(parsedData);

      case 'save':
        // Salva i dati nel file
        if (req.method !== 'POST') {
          return res.status(405).json({ message: 'Method not allowed' });
        }

        const { palaces } = req.body;

        if (!palaces || !Array.isArray(palaces)) {
          return res.status(400).json({ message: 'Invalid data format' });
        }

        const saveData = {
          version: '2.0.0',
          lastUpdated: new Date().toISOString(),
          palaces,
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(saveData, null, 2));
        return res.status(200).json({ success: true });

      default:
        return res.status(404).json({ message: 'Action not found' });
    }
  } catch (error) {
    console.error('Data API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Per gestire palazzi con molte immagini
    },
  },
};