// lib/standardPalaces.ts - COMPLETO E CORRETTO
import { StandardPalaceMetadata, Palace, PalaceImage } from '@/types';

export const STANDARD_PALACES: StandardPalaceMetadata[] = [
  {
    id: 'roman-forum',
    name: 'Foro Romano',
    description: 'Il cuore dell\'antica Roma, perfetto per memorizzare la storia romana',
    category: 'Storia',
    thumbnail: '/standard-palaces/roman-forum/thumbnail.jpg',
    imageCount: 5,
    annotationCount: 20,
    imagesFolder: '/standard-palaces/roman-forum/images',
  },
];

export function getCategories(): string[] {
  const categories = new Set(STANDARD_PALACES.map(p => p.category));
  return Array.from(categories);
}

export async function cloneStandardPalace(palaceId: string): Promise<Omit<Palace, 'createdAt' | 'updatedAt'>> {
  const metadata = STANDARD_PALACES.find(p => p.id === palaceId);
  
  if (!metadata) {
    throw new Error(`Palazzo standard non trovato: ${palaceId}`);
  }

  const images: PalaceImage[] = [];
  for (let i = 0; i < metadata.imageCount; i++) {
    const imagePath = `${metadata.imagesFolder}/image-${i + 1}.jpg`;
    
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      images.push({
        id: `img_${Date.now()}_${i}`,
        fileName: `image-${i + 1}.jpg`,
        name: `Immagine ${i + 1}`,
        dataUrl,
        width: 2048,
        height: 1024,
        is360: true,
        annotations: [],
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Errore caricamento immagine ${i + 1}:`, error);
    }
  }

  return {
    _id: `palace_${Date.now()}`,
    name: `${metadata.name} (Copia)`,
    description: metadata.description,
    images,
  };
}

export function exportPalace(palace: Palace): void {
  const dataStr = JSON.stringify(palace, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${palace.name.replace(/\s+/g, '-')}_${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

export async function importPalace(file: File): Promise<Palace> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const palace = JSON.parse(e.target?.result as string);
        
        if (!palace._id || !palace.name || !Array.isArray(palace.images)) {
          throw new Error('Formato palazzo non valido');
        }
        
        palace._id = `palace_${Date.now()}`;
        palace.createdAt = new Date();
        palace.updatedAt = new Date();
        
        resolve(palace);
      } catch (error) {
        reject(new Error('Errore parsing file JSON'));
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsText(file);
  });
}