// components/annotations/AnnotationModal.tsx - VERSIONE COMPLETA E CORRETTA
import { useState, useRef, useEffect } from 'react';
import { X, Upload, Pencil, Eraser, Save, Palette } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { usePalaceStore } from '@/lib/store';
import { imageDB, fileToDataURL } from '@/lib/imageDB';
import { Annotation } from '@/types';

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  palaceId: string;
  imageId: string;
  position: { x: number; y: number; z: number };
  editingAnnotation?: Annotation | null;
}

type DrawMode = 'none' | 'draw' | 'erase';

// ✅ Helper function per creare annotazioni con tutti i campi obbligatori
const createNewAnnotation = (
  text: string,
  note: string,
  position: { x: number; y: number; z: number },
  imageUrl?: string,
  imageIndexedDBKey?: string
): Omit<Annotation, 'id' | 'createdAt'> => ({
  text,
  note,
  position,
  rotation: { x: 0, y: 0, z: 0 },
  width: 1,
  height: 1,
  isVisible: true,
  selected: false,
  imageUrl,
  imageIndexedDBKey,
  isGenerated: false,
});

export default function AnnotationModal({ 
  isOpen, 
  onClose, 
  palaceId, 
  imageId, 
  position,
  editingAnnotation 
}: AnnotationModalProps) {
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [imageSource, setImageSource] = useState<'none' | 'upload' | 'draw'>('none');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>('draw');
  const [brushSize, setBrushSize] = useState(3);
  const [color, setColor] = useState('#000000');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const { addAnnotation, updateAnnotation } = usePalaceStore();

  // Carica dati se in modalità edit
  useEffect(() => {
    if (editingAnnotation) {
      setText(editingAnnotation.text);
      setNote(editingAnnotation.note || '');
      if (editingAnnotation.imageUrl) {
        setImagePreview(editingAnnotation.imageUrl);
        setImageSource('upload');
      }
    } else {
      // Reset per nuova annotazione
      setText('');
      setNote('');
      setImageSource('none');
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingAnnotation, isOpen]);

  // Setup canvas
  useEffect(() => {
    if (imageSource === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [imageSource]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo file immagine sono supportati');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine deve essere sotto i 5MB');
      return;
    }

    setImageFile(file);
    const preview = await fileToDataURL(file);
    setImagePreview(preview);
    setError(null);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'draw') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (drawMode === 'erase') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    return canvas.toDataURL('image/png');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Inserisci il testo dell\'annotazione');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      let imageIndexedDBKey: string | undefined;

      // Salva l'immagine se presente
      if (imageSource === 'draw') {
        const drawingData = saveDrawing();
        if (drawingData) {
          imageUrl = drawingData;
        }
      } else if (imageSource === 'upload' && imageFile) {
        if (imageFile.size > 1 * 1024 * 1024) {
          imageIndexedDBKey = await imageDB.saveImage(imageFile);
        } else {
          imageUrl = imagePreview || undefined;
        }
      }

      if (editingAnnotation) {
        // Modifica annotazione esistente
        updateAnnotation(palaceId, imageId, editingAnnotation.id, {
          text: text.trim(),
          note: note.trim(),
          imageUrl,
          imageIndexedDBKey,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // ✅ Crea nuova annotazione usando la funzione helper
        const newAnnotation = createNewAnnotation(
          text.trim(),
          note.trim(),
          position,
          imageUrl,
          imageIndexedDBKey
        );
        
        addAnnotation(palaceId, imageId, newAnnotation);
      }

      onClose();
    } catch (err) {
      console.error('Error saving annotation:', err);
      setError('Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editingAnnotation ? 'Modifica Annotazione' : 'Nuova Annotazione'}
      size="lg"
    >
      <div onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-6">
            {/* Testo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testo/Concetto *
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Es: Formula chimica del glucosio"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Nota */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota/Spiegazione
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Descrivi l'immagine mentale..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Selettore tipo immagine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Immagine Associata (opzionale)
              </label>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setImageSource('none')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    imageSource === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nessuna
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    imageSource === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Carica
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('draw')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    imageSource === 'draw'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                  Disegna
                </button>
              </div>

              {/* Upload Section */}
              {imageSource === 'upload' && (
                <div>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full rounded-lg max-h-64 object-contain bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 font-medium mb-1">
                          Carica un'immagine
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG fino a 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Draw Section */}
              {imageSource === 'draw' && (
                <div className="space-y-3">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawMode('draw')}
                        className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium ${
                          drawMode === 'draw'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Pencil className="w-4 h-4" />
                        Disegna
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawMode('erase')}
                        className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium ${
                          drawMode === 'erase'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Eraser className="w-4 h-4" />
                        Gomma
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="flex items-center gap-2 px-2">
                        <Palette className="w-4 h-4 text-gray-600" />
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600 w-10">{brushSize}px</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-3 py-2 bg-white text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                    >
                      Pulisci
                    </button>
                  </div>

                  {/* Canvas */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={700}
                      height={400}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full cursor-crosshair bg-white"
                      style={{ touchAction: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvataggio...' : editingAnnotation ? 'Salva Modifiche' : 'Crea Annotazione'}
          </button>
        </ModalFooter>
      </div>
    </Modal>
  );
}