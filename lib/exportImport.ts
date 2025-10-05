// lib/exportImport.ts - Export/Import CORRETTO
import { Palace, ExportData } from '@/types';
import { imageDB } from './imageDB';

export async function exportBackup(palaces: Palace[]): Promise<void> {
  try {
    const imagesMap: Record<string, string> = {};

    for (const palace of palaces) {
      for (const image of palace.images) {
        if (image.indexedDBKey) {
          const file = await imageDB.getImage(image.indexedDBKey);
          if (file) {
            const dataUrl = await fileToDataURL(file);
            imagesMap[image.indexedDBKey] = dataUrl;
          }
        }

        for (const annotation of image.annotations) {
          if (annotation.imageIndexedDBKey) {
            const file = await imageDB.getImage(annotation.imageIndexedDBKey);
            if (file) {
              const dataUrl = await fileToDataURL(file);
              imagesMap[annotation.imageIndexedDBKey] = dataUrl;
            }
          }
        }
      }
    }

    const exportData: ExportData = {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      palaces: palaces,
    };

    const fullExport = {
      ...exportData,
      images: Object.keys(imagesMap).length > 0 ? imagesMap : undefined,
    };

    const dataStr = JSON.stringify(fullExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `memorium-backup-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('✅ Backup esportato con successo');
  } catch (error) {
    console.error('Errore durante l\'export:', error);
    throw new Error('Impossibile esportare il backup');
  }
}

export async function importBackup(file: File): Promise<Palace[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        
        if (!backup.palaces || !Array.isArray(backup.palaces)) {
          throw new Error('Formato backup non valido');
        }

        const palaces: Palace[] = [];

        if (backup.images && typeof backup.images === 'object') {
          for (const [key, dataUrl] of Object.entries(backup.images)) {
            try {
              const file = await dataURLToFile(dataUrl as string, key);
              await imageDB.saveImage(file);
            } catch (error) {
              console.error(`Errore ripristino immagine ${key}:`, error);
            }
          }
        }

        for (const palaceData of backup.palaces) {
          const palace: Palace = {
            ...palaceData,
            id: `palace_${Date.now()}_${Math.random()}`,
            _id: `palace_${Date.now()}_${Math.random()}`,
            createdAt: new Date(palaceData.createdAt),
            updatedAt: new Date(palaceData.updatedAt),
          };

          palace.images = palace.images.map(img => ({
            ...img,
            id: `img_${Date.now()}_${Math.random()}`,
          }));

          palaces.push(palace);
        }

        resolve(palaces);
      } catch (error) {
        reject(new Error('Errore parsing backup: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsText(file);
  });
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataURLToFile(dataUrl: string, filename: string): Promise<File> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: blob.type }));
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
        
        if (!palace.id && !palace._id || !palace.name || !Array.isArray(palace.images)) {
          throw new Error('Formato palazzo non valido');
        }
        
        palace.id = `palace_${Date.now()}`;
        palace._id = `palace_${Date.now()}`;
        palace.createdAt = new Date(palace.createdAt || Date.now());
        palace.updatedAt = new Date(palace.updatedAt || Date.now());
        
        resolve(palace);
      } catch (error) {
        reject(new Error('Errore parsing file JSON'));
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsText(file);
  });
}