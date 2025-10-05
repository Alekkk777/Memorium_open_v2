// components/Onboarding.tsx - Aggiungi isTutorialMode
import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  isTutorialMode?: boolean; // ✅ Aggiungi questa riga
}

const steps = [
  {
    title: "Benvenuto in Memorium!",
    description: "Crea palazzi della memoria 3D per memorizzare qualsiasi cosa usando la tecnica dei loci.",
    image: "🏛️",
    tips: [
      "I tuoi dati rimangono nel browser",
      "Nessun account necessario",
      "Funziona offline"
    ]
  },
  {
    title: "Crea il tuo primo palazzo",
    description: "Carica foto 360° dei tuoi ambienti (casa, ufficio, luoghi visitati) oppure usa immagini normali.",
    image: "📸",
    tips: [
      "Usa app come Google Street View per creare foto 360°",
      "Anche foto normali funzionano",
      "Puoi aggiungere più stanze allo stesso palazzo"
    ]
  },
  {
    title: "Aggiungi annotazioni",
    description: "Clicca direttamente nell'immagine per posizionare le informazioni che vuoi memorizzare.",
    image: "📝",
    tips: [
      "Click nell'immagine = posiziona annotazione",
      "Aggiungi testo, note e immagini",
      "Usa la AI per generare automaticamente"
    ]
  },
  {
    title: "Esplora e memorizza",
    description: "Naviga nel tuo palazzo in 3D. Le informazioni nel contesto spaziale sono più facili da ricordare.",
    image: "🧠",
    tips: [
      "Trascina per ruotare la visuale",
      "Scroll per zoom",
      "Click sulle annotazioni per espanderle"
    ]
  },
  {
    title: "Genera con AI (opzionale)",
    description: "Incolla i tuoi appunti e lascia che l'AI crei immagini mentali vivide per te.",
    image: "✨",
    tips: [
      "Aggiungi la tua API key OpenAI nelle impostazioni",
      "L'AI trasforma testo in scene memorabili",
      "Completamente opzionale"
    ]
  }
];

export default function Onboarding({ onComplete, onSkip, isTutorialMode = false }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Safety check
  const safeCurrentStep = Math.min(Math.max(0, currentStep), steps.length - 1);
  const step = steps[safeCurrentStep];
  
  if (!step) {
    console.error('Step non trovato:', safeCurrentStep);
    return null;
  }

  const progress = ((safeCurrentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{step.image || '📚'}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isTutorialMode ? 'Tutorial - ' : ''}{step.title}
              </h2>
              <p className="text-sm text-gray-500">Passo {safeCurrentStep + 1} di {steps.length}</p>
            </div>
          </div>
          
          <button
            onClick={onSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-lg text-gray-700 mb-6">
            {step.description}
          </p>

          <div className="bg-blue-50 rounded-lg p-6 space-y-3">
            <p className="font-semibold text-blue-900 text-sm uppercase tracking-wide">
              Suggerimenti
            </p>
            {step.tips && step.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <button
            onClick={handlePrev}
            disabled={safeCurrentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Indietro
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === safeCurrentStep 
                    ? 'bg-blue-600 w-6' 
                    : index < safeCurrentStep 
                    ? 'bg-blue-400' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {safeCurrentStep === steps.length - 1 ? (isTutorialMode ? 'Chiudi' : 'Inizia') : 'Avanti'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}