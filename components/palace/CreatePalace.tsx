// components/palace/CreatePalace.tsx - VERSIONE FINALE CORRETTA
import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { usePalaceStore } from '@/lib/store';
import { imageDB, fileToDataURL, is360Image } from '@/lib/imageDB';
import { PalaceImage } from '@/types';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';

interface CreatePalaceProps {
  onClose: () => void;
}

export default function CreatePalace({ onClose }: CreatePalaceProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addPalace } = usePalaceStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Solo file immagine sono supportati');
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('Le immagini devono essere sotto i 50MB');
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Inserisci un nome per il palazzo');
      return;
    }

    if (files.length === 0) {
      setError('Carica almeno una immagine');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const images: PalaceImage[] = await Promise.all(
        files.map(async (file) => {
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
        name,
        description,
        images: images,
      });

      onClose();
    } catch (err) {
      console.error('Error creating palace:', err);
      setError('Errore durante la creazione del palazzo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title="Crea Palazzo da Zero"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome del Palazzo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es: La mia casa, Ufficio, Università..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione (opzionale)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrivi brevemente questo palazzo..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isUploading}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Come creare foto 360°</p>
                <p>
                  Usa la app Google Street View per creare immagini panoramiche dei tuoi ambienti.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immagini 360° *
              </label>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Clicca per caricare</span> o trascina qui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG fino a 50MB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-4 p-1 hover:bg-gray-200 rounded transition-colors"
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUploading}
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isUploading || !name.trim() || files.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Creazione...' : 'Crea Palazzo'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}