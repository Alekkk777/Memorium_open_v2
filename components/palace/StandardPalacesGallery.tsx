// components/palace/StandardPalacesGallery.tsx - VERSIONE CORRETTA
import { useState } from 'react';
import { Copy, X, FolderOpen } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { usePalaceStore } from '@/lib/store';
import { imageDB, fileToDataURL, is360Image } from '@/lib/imageDB';
import { PalaceImage } from '@/types';

interface StandardPalacesGalleryProps {
  onClose: () => void;
}

export default function StandardPalacesGallery({ onClose }: StandardPalacesGalleryProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [palaceName, setPalaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addPalace } = usePalaceStore();

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setError('Nessuna immagine valida trovata nella cartella');
      return;
    }

    setSelectedFiles(validFiles);
    
    // Auto-genera nome dal primo file
    if (!palaceName && validFiles[0]) {
      const folderName = validFiles[0].webkitRelativePath?.split('/')[0] || 'Palazzo Standard';
      setPalaceName(folderName);
    }
    
    setError(null);
  };

  const handleCreate = async () => {
    if (!palaceName.trim()) {
      setError('Inserisci un nome per il palazzo');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Seleziona una cartella con immagini');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const images: PalaceImage[] = await Promise.all(
        selectedFiles.map(async (file) => {
          const img = new Image();
          const dataUrl = await fileToDataURL(file);
          
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = dataUrl;
          });

          const width = img.width;
          const height = img.height;
          const isPanorama = is360Image(width, height);

          let imageData: PalaceImage = {
            id: `img_${Date.now()}_${Math.random()}`,
            name: file.name,
            fileName: file.name,
            width,
            height,
            is360: isPanorama,
            annotations: [],
            createdAt: new Date().toISOString(),
          };

          if (file.size > 2 * 1024 * 1024) {
            const key = await imageDB.saveImage(file);
            imageData.indexedDBKey = key;
          } else {
            imageData.dataUrl = dataUrl;
          }

          return imageData;
        })
      );

      await addPalace({
        name: palaceName,
        description: `Palazzo standard creato da cartella - ${selectedFiles.length} immagini`,
        images: images,
      });

      onClose();
    } catch (err) {
      console.error('Error creating standard palace:', err);
      setError('Errore durante la creazione del palazzo');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title="Carica Palazzo Standard da Cartella"
      size="lg"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Info */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900 mb-2">
              <strong>📁 Come funziona:</strong>
            </p>
            <p className="text-xs text-purple-800">
              Prepara una cartella sul tuo computer con tutte le foto 360° che vuoi usare come palazzo standard.
              Poi seleziona quella cartella qui sotto e Memorium caricherà tutte le immagini!
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Nome Palazzo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome del Palazzo *
            </label>
            <input
              type="text"
              value={palaceName}
              onChange={(e) => setPalaceName(e.target.value)}
              placeholder="Es: Foro Romano, Biblioteca Classica..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isCreating}
            />
          </div>

          {/* Folder Upload - FIX per TypeScript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Cartella con Immagini *
            </label>
            
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-purple-50 hover:bg-purple-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FolderOpen className="w-12 h-12 text-purple-400 mb-3" />
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Clicca per selezionare una cartella
                </p>
                <p className="text-xs text-gray-500">
                  Tutte le immagini nella cartella verranno caricate
                </p>
              </div>
              <input
                type="file"
                {...({ webkitdirectory: '', directory: '' } as any)}
                multiple
                onChange={handleFolderSelect}
                className="hidden"
                disabled={isCreating}
              />
            </label>
          </div>

          {/* Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                ✅ {selectedFiles.length} immagini selezionate
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedFiles.slice(0, 5).map((file, index) => (
                  <p key={index} className="text-xs text-gray-600 truncate">
                    {file.name}
                  </p>
                ))}
                {selectedFiles.length > 5 && (
                  <p className="text-xs text-gray-500 italic">
                    ... e altre {selectedFiles.length - 5} immagini
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isCreating}
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating || !palaceName.trim() || selectedFiles.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Copy className="w-4 h-4" />
          {isCreating ? 'Creazione...' : 'Crea Palazzo'}
        </button>
      </ModalFooter>
    </Modal>
  );
}