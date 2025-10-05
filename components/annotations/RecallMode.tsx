// components/annotations/RecallMode.tsx - FIX CARICAMENTO IMMAGINI
import { useState, useEffect } from 'react';
import { Palace, Annotation } from '@/types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { imageDB } from '@/lib/imageDB';
import { 
  X, 
  Check, 
  XCircle, 
  Eye, 
  RotateCcw,
  Trophy,
  Target,
  TrendingUp,
  Brain
} from 'lucide-react';

interface RecallModeProps {
  palace: Palace;
  onClose: () => void;
  onComplete: (results: RecallResults) => void;
}

export interface RecallResults {
  totalAnnotations: number;
  remembered: number;
  forgotten: number;
  skipped: number;
  accuracy: number;
  duration: number;
  annotationResults: AnnotationResult[];
}

interface AnnotationResult {
  annotationId: string;
  imageIndex: number;
  remembered: boolean | null;
  attempts: number;
  timeSpent: number;
}

type RecallStep = 'intro' | 'study' | 'test' | 'results';

export default function RecallMode({ palace, onClose, onComplete }: RecallModeProps) {
  const [currentStep, setCurrentStep] = useState<RecallStep>('intro');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAnnotationIndex, setCurrentAnnotationIndex] = useState(0);
  const [revealedCurrent, setRevealedCurrent] = useState(false);
  
  const [results, setResults] = useState<AnnotationResult[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [annotationStartTime, setAnnotationStartTime] = useState<number>(0);
  
  const [stats, setStats] = useState({
    remembered: 0,
    forgotten: 0,
    skipped: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const currentImage = palace.images[currentImageIndex];
  const allAnnotations = palace.images.flatMap((img, imgIndex) => 
    img.annotations.map(ann => ({ ...ann, imageIndex: imgIndex }))
  );
  const currentAnnotation = allAnnotations[currentAnnotationIndex];
  const progress = ((currentAnnotationIndex + 1) / allAnnotations.length) * 100;

  useEffect(() => {
    if (currentStep === 'test') {
      setAnnotationStartTime(Date.now());
    }
  }, [currentAnnotationIndex, currentStep]);

  const handleStart = () => {
    setCurrentStep('study');
    setStartTime(Date.now());
  };

  const handleStartTest = () => {
    setCurrentStep('test');
    setRevealedCurrent(false);
  };

  const handleRecall = (remembered: boolean) => {
    const timeSpent = Date.now() - annotationStartTime;
    
    const result: AnnotationResult = {
      annotationId: currentAnnotation.id,
      imageIndex: currentAnnotation.imageIndex,
      remembered,
      attempts: 1,
      timeSpent,
    };

    setResults(prev => [...prev, result]);

    setStats(prev => {
      const newStats = { ...prev };
      
      if (remembered) {
        newStats.remembered++;
        newStats.currentStreak++;
        if (newStats.currentStreak > newStats.bestStreak) {
          newStats.bestStreak = newStats.currentStreak;
        }
      } else {
        newStats.forgotten++;
        newStats.currentStreak = 0;
      }

      return newStats;
    });

    if (currentAnnotationIndex < allAnnotations.length - 1) {
      setCurrentAnnotationIndex(curr => curr + 1);
      setCurrentImageIndex(allAnnotations[currentAnnotationIndex + 1].imageIndex);
      setRevealedCurrent(false);
    } else {
      const finalResults: RecallResults = {
        totalAnnotations: allAnnotations.length,
        remembered: stats.remembered + (remembered ? 1 : 0),
        forgotten: stats.forgotten + (!remembered ? 1 : 0),
        skipped: stats.skipped,
        accuracy: ((stats.remembered + (remembered ? 1 : 0)) / allAnnotations.length) * 100,
        duration: Date.now() - startTime,
        annotationResults: [...results, result],
      };
      
      setCurrentStep('results');
      onComplete(finalResults);
    }
  };

  const handleReveal = () => {
    setRevealedCurrent(true);
  };

  const renderIntro = () => (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <Brain className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Modalità Recall
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Testa la tua memoria! Esplorerai il palazzo e dovrai ricordare cosa si trova in ogni punto.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="p-6 bg-blue-50 rounded-xl">
          <div className="text-blue-600 mb-3">
            <Eye className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Fase 1: Studio</h3>
          <p className="text-sm text-gray-600">
            Esplora il palazzo con tutte le annotazioni visibili. Prendi tutto il tempo necessario.
          </p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl">
          <div className="text-purple-600 mb-3">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Fase 2: Test</h3>
          <p className="text-sm text-gray-600">
            Il palazzo sarà vuoto. Cerca di ricordare cosa c'è in ogni punto.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
        <p className="text-sm text-yellow-800 flex items-start gap-2">
          <Target className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Obiettivo:</strong> Ricorda almeno l'80% per consolidare la memoria a lungo termine.
          </span>
        </p>
      </div>

      <div className="text-center space-y-3 pt-4">
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg"
        >
          Inizia Studio
        </button>
        
        <div className="text-sm text-gray-500">
          {allAnnotations.length} annotazioni in {palace.images.length} stanze
        </div>
      </div>
    </div>
  );

  const renderStudy = () => (
    <div className="h-full flex flex-col">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Fase Studio</h3>
            <p className="text-sm text-blue-100">Esplora e memorizza</p>
          </div>
        </div>
        
        <button
          onClick={handleStartTest}
          className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          Inizia Test
        </button>
      </div>

      <div className="flex-1 relative">
        <PalaceViewerSimple 
          palace={palace}
          imageIndex={currentImageIndex}
          annotations={currentImage.annotations}
          showAnnotations={true}
          is360={currentImage.is360 || false}
        />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
            disabled={currentImageIndex === 0}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ← Precedente
          </button>

          <div className="text-center">
            <p className="font-semibold text-gray-900">
              Stanza {currentImageIndex + 1} / {palace.images.length}
            </p>
          </div>

          <button
            onClick={() => setCurrentImageIndex(Math.min(palace.images.length - 1, currentImageIndex + 1))}
            disabled={currentImageIndex === palace.images.length - 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Successiva →
          </button>
        </div>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="h-full flex flex-col">
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Test Recall</h3>
              <p className="text-sm text-purple-100">
                {currentAnnotationIndex + 1} / {allAnnotations.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-purple-100">Streak</p>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Ricordate</p>
              <p className="text-2xl font-bold">{stats.remembered}</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-purple-700 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <PalaceViewerSimple 
          palace={palace}
          imageIndex={currentAnnotation.imageIndex}
          annotations={revealedCurrent ? [currentAnnotation] : []}
          showAnnotations={revealedCurrent}
          is360={palace.images[currentAnnotation.imageIndex].is360 || false}
        />

        {!revealedCurrent && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Cosa ricordi qui?
              </h3>
              
              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <p className="text-xl font-bold text-purple-900">
                  "{currentAnnotation.text}"
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleRecall(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold"
                >
                  <Check className="w-6 h-6" />
                  Ricordato ✅
                </button>

                <button
                  onClick={() => handleRecall(false)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold"
                >
                  <XCircle className="w-6 h-6" />
                  Non Ricordo ❌
                </button>

                <button
                  onClick={handleReveal}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  <Eye className="w-5 h-5" />
                  Mostra Aiuto
                </button>
              </div>
            </div>
          </div>
        )}

        {revealedCurrent && (
          <div className="absolute top-6 right-6 bg-white rounded-xl shadow-lg p-6 max-w-md">
            <h4 className="font-bold text-gray-900 mb-2">{currentAnnotation.text}</h4>
            <p className="text-sm text-gray-600 mb-4">{currentAnnotation.note}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleRecall(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                OK
              </button>
              <button
                onClick={() => handleRecall(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                NO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    const accuracy = (stats.remembered / allAnnotations.length) * 100;

    return (
      <div className="p-8 space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Completato!
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <p className="text-sm text-green-600 font-medium mb-1">Ricordate</p>
            <p className="text-4xl font-bold text-green-700">{stats.remembered}</p>
          </div>

          <div className="bg-red-50 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600 font-medium mb-1">Dimenticate</p>
            <p className="text-4xl font-bold text-red-700">{stats.forgotten}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">Accuratezza</p>
            <p className="text-4xl font-bold text-blue-700">{accuracy.toFixed(0)}%</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <p className="text-sm text-purple-600 font-medium mb-1">Best Streak</p>
            <p className="text-4xl font-bold text-purple-700">{stats.bestStreak}</p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          accuracy >= 80 ? 'bg-green-50 border-2 border-green-500' :
          accuracy >= 60 ? 'bg-yellow-50 border-2 border-yellow-500' :
          'bg-red-50 border-2 border-red-500'
        }`}>
          <h3 className="font-bold text-lg mb-1">
            {accuracy >= 80 ? '🎉 Ottimo!' :
             accuracy >= 60 ? '👍 Buon Lavoro!' :
             '💪 Continua!'}
          </h3>
          <p className="text-sm">
            {accuracy >= 80 
              ? 'Hai memorizzato la maggior parte! Continua così.'
              : accuracy >= 60
              ? 'Buon risultato! Ripeti per migliorare.'
              : 'La memoria migliora con la pratica. Riprova!'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setCurrentStep('intro');
              setCurrentImageIndex(0);
              setCurrentAnnotationIndex(0);
              setResults([]);
              setStats({ remembered: 0, forgotten: 0, skipped: 0, currentStreak: 0, bestStreak: 0 });
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Ripeti
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="h-full">
        {currentStep === 'intro' && renderIntro()}
        {currentStep === 'study' && renderStudy()}
        {currentStep === 'test' && renderTest()}
        {currentStep === 'results' && renderResults()}
      </div>
    </div>
  );
}

// 🔥 FIX: Nuovo componente che carica correttamente da IndexedDB
interface PalaceViewerSimpleProps {
  palace: Palace;
  imageIndex: number;
  annotations: Annotation[];
  showAnnotations: boolean;
  is360: boolean;
}

function PalaceViewerSimple({ 
  palace,
  imageIndex,
  annotations, 
  showAnnotations,
  is360 
}: PalaceViewerSimpleProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentImage = palace.images[imageIndex];

  // 🔥 FIX: Carica correttamente da IndexedDB o dataUrl
  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      if (!currentImage) return;
      
      setIsLoading(true);
      setError(false);

      try {
        if (currentImage.indexedDBKey) {
          // Carica da IndexedDB
          const url = await imageDB.getImageUrl(currentImage.indexedDBKey);
          if (mounted) {
            setImageUrl(url);
            setIsLoading(false);
          }
        } else if (currentImage.dataUrl) {
          // Usa dataUrl
          if (mounted) {
            setImageUrl(currentImage.dataUrl);
            setIsLoading(false);
          }
        } else {
          console.error('No image source available');
          if (mounted) {
            setError(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [currentImage?.id, currentImage?.indexedDBKey, currentImage?.dataUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Caricamento immagine...</p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white text-center">
          <p className="text-red-400 mb-2">❌ Errore caricamento immagine</p>
          <p className="text-sm text-gray-400">{currentImage?.fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      <Scene360Simple
        imageUrl={imageUrl}
        annotations={annotations}
        is360={is360}
        showAnnotations={showAnnotations}
      />
    </Canvas>
  );
}

// Scene component separato
interface Scene360SimpleProps {
  imageUrl: string;
  annotations: Annotation[];
  is360: boolean;
  showAnnotations: boolean;
}

function Scene360Simple({ imageUrl, annotations, is360, showAnnotations }: Scene360SimpleProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (loadedTexture: THREE.Texture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl]);

  if (!texture) return null;

  return (
    <>
      {is360 ? (
        <mesh>
          <sphereGeometry args={[500, 60, 40]} />
          <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
      ) : (
        <mesh position={[0, 0, -10]}>
          <planeGeometry args={[16, 9]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}

      {showAnnotations && annotations.map((ann) => (
        <mesh
          key={ann.id}
          position={[
            ann.position.x * (is360 ? 400 : 8),
            ann.position.y * (is360 ? 400 : 4.5),
            ann.position.z * (is360 ? 400 : -9)
          ]}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.9} />
        </mesh>
      ))}

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        rotateSpeed={-0.5}
      />
    </>
  );
}