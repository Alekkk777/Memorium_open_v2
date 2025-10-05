// components/annotations/ImprovedAIFlow.tsx - Flow AI ottimizzato
import { useState } from 'react';
import { X, Sparkles, AlertCircle, Check, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { Palace } from '@/types';
import { usePalaceStore } from '@/lib/store';
import { generateAnnotations, isAIEnabled } from '@/lib/aiGenerator';

interface ImprovedAIFlowProps {
  palace: Palace;
  onClose: () => void;
}

type Step = 'input' | 'preview' | 'generating' | 'review' | 'complete';

export default function ImprovedAIFlow({ palace, onClose }: ImprovedAIFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [notesText, setNotesText] = useState('');
  const [targetCount, setTargetCount] = useState(10);
  const [generatedAnnotations, setGeneratedAnnotations] = useState<any[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const { addAnnotation } = usePalaceStore();

  const handleGenerate = async () => {
    if (!notesText.trim()) {
      setError('Inserisci del testo da cui generare le annotazioni');
      return;
    }

    if (!isAIEnabled()) {
      setError('API Key OpenAI non configurata. Vai in Impostazioni per aggiungerla.');
      return;
    }

    setCurrentStep('generating');
    setError(null);
    setProgress('Analizzando il testo...');

    try {
      const generated = await generateAnnotations({
        notesText,
        targetCount,
        imagesCount: palace.images.length,
        language: 'italiano',
      });

      setProgress(`Generati ${generated.length} annotazioni!`);
      setGeneratedAnnotations(generated);
      
      // Seleziona tutte di default
      setSelectedAnnotations(new Set(generated.map((_, i) => i.toString())));
      
      setTimeout(() => {
        setCurrentStep('review');
      }, 1000);
    } catch (err) {
      console.error('Errore generazione AI:', err);
      setError(err instanceof Error ? err.message : 'Errore durante la generazione');
      setCurrentStep('input');
    }
  };

  const handleConfirm = () => {
    const selected = generatedAnnotations.filter((_, i) => 
      selectedAnnotations.has(i.toString())
    );

    // Aggiungi le annotazioni selezionate
    for (const annotation of selected) {
      const imageId = palace.images[annotation.imageIndex]?.id;
      if (!imageId) continue;

      const position = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      };

      addAnnotation(palace._id, imageId, {
        text: annotation.description,
        note: annotation.note,
        position,
        rotation: { x: 0, y: 0, z: 0 },
        width: 100,
        height: 100,
        isVisible: true,
        selected: false,
        isGenerated: true,
      });
    }

    setCurrentStep('complete');
    setTimeout(() => onClose(), 2000);
  };

  const toggleAnnotation = (index: string) => {
    const newSelected = new Set(selectedAnnotations);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedAnnotations(newSelected);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Genera con AI</h2>
              <p className="text-sm text-gray-600">
                {currentStep === 'input' && 'Incolla i tuoi appunti'}
                {currentStep === 'preview' && 'Anteprima configurazione'}
                {currentStep === 'generating' && 'Generazione in corso...'}
                {currentStep === 'review' && 'Rivedi e seleziona'}
                {currentStep === 'complete' && 'Completato!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={currentStep === 'generating'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {[
              { key: 'input', label: 'Input' },
              { key: 'generating', label: 'Genera' },
              { key: 'review', label: 'Rivedi' },
            ].map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step.key || (index < ['input', 'generating', 'review'].indexOf(currentStep as any))
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['input', 'generating', 'review'].indexOf(currentStep as any) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-2">
                  <div className={`h-full transition-all ${
                    index < ['input', 'generating', 'review'].indexOf(currentStep as any)
                      ? 'bg-purple-600'
                      : 'bg-gray-200'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: Input */}
          {currentStep === 'input' && (
            <div className="space-y-6">
              {!isAIEnabled() && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">API Key non configurata</p>
                    <p>
                      Vai in Impostazioni e aggiungi la tua OpenAI API key per usare questa funzione.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appunti da Memorizzare
                </label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Incolla qui i tuoi appunti o il testo che vuoi memorizzare...

Esempio:
- Il glucosio (C6H12O6) è un monosaccaride
- Struttura ad anello a 6 atomi di carbonio
- Fonte primaria di energia per le cellule"
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  disabled={!isAIEnabled()}
                />
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>{notesText.length} caratteri</span>
                  <span>Consigliato: 500-2000 caratteri</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero di Annotazioni da Generare
                </label>
                <input
                  type="number"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 10)}
                  min={1}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!isAIEnabled()}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Verranno distribuite tra le {palace.images.length} immagini del palazzo
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={!isAIEnabled()}
                >
                  Annulla
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!isAIEnabled() || !notesText.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Genera Annotazioni
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Generating */}
          {currentStep === 'generating' && (
            <div className="py-12 text-center">
              <div className="mb-6">
                <div className="inline-block relative">
                  <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generazione in corso...
              </h3>
              <p className="text-gray-600">{progress}</p>
            </div>
          )}

          {/* STEP 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">
                    {selectedAnnotations.size} annotazioni selezionate
                  </p>
                  <p className="text-sm text-purple-700">
                    Deseleziona quelle che non vuoi aggiungere
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAnnotations(
                    selectedAnnotations.size === generatedAnnotations.length
                      ? new Set()
                      : new Set(generatedAnnotations.map((_, i) => i.toString()))
                  )}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectedAnnotations.size === generatedAnnotations.length ? 'Deseleziona tutte' : 'Seleziona tutte'}
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedAnnotations.map((annotation, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      selectedAnnotations.has(index.toString())
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleAnnotation(index.toString())}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedAnnotations.has(index.toString())
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnnotations.has(index.toString()) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {annotation.description}
                          </h4>
                          <span className="text-xs text-gray-500">
                            Stanza {annotation.imageIndex + 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{annotation.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep('input')}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedAnnotations.size === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  Aggiungi {selectedAnnotations.size} Annotazioni
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Complete */}
          {currentStep === 'complete' && (
            <div className="py-12 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-green-100 rounded-full">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Annotazioni Aggiunte!
              </h3>
              <p className="text-gray-600">
                Le annotazioni sono state aggiunte al tuo palazzo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}