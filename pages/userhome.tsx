// pages/userhome.tsx - VERSIONE COMPLETA CON RECALL MODE
import { useEffect, useState } from 'react';
import { usePalaceStore, useUIStore } from '@/lib/store';
import dynamic from 'next/dynamic';
import { 
  Plus, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  HelpCircle, 
  Brain, 
  Target,
  TrendingUp,
  Eye,
  BarChart3,
  Zap
} from 'lucide-react';
import Onboarding from '@/components/Onboarding';
import PalaceCreationChoice from '@/components/palace/PalaceCreationChoice';
import RecallMode from '@/components/annotations/RecallMode';
import RecallStatsView from '@/components/palace/RecallStatsView';
import { RecallResults } from '@/components/annotations/RecallMode';
import { saveRecallSession, generateSessionId } from '@/lib/recallStorage';

const PalaceList = dynamic(() => import('@/components/palace/PalaceList'), { ssr: false });
const PalaceViewer = dynamic(() => import('@/components/palace/PalaceViewer'), { ssr: false });
const AnnotationList = dynamic(() => import('@/components/annotations/AnnotationList'), { ssr: false });
const Settings = dynamic(() => import('@/components/Settings'), { ssr: false });

type ViewMode = 'explorer' | 'recall' | 'stats';

export default function UserHome() {
  const { palaces, currentPalaceId, loadPalaces, isLoading } = usePalaceStore();
  const { isSettingsOpen, setSettingsOpen } = useUIStore();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPalaceCreation, setShowPalaceCreation] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  
  // 🆕 Recall Mode States
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastRecallResults, setLastRecallResults] = useState<RecallResults | null>(null);

  const currentPalace = palaces.find(p => p._id === currentPalaceId);
  const totalAnnotations = currentPalace?.images.reduce((sum, img) => sum + img.annotations.length, 0) || 0;

  useEffect(() => {
    loadPalaces();
    
    const hasSeenOnboarding = localStorage.getItem('memorium_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [loadPalaces]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('memorium_onboarding_seen', 'true');
    setShowOnboarding(false);
    setShowPalaceCreation(true);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('memorium_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  // 🆕 Gestione Recall Mode
  const handleStartRecall = () => {
    if (!currentPalace) {
      alert('❌ Seleziona un palazzo prima di iniziare');
      return;
    }

    if (totalAnnotations === 0) {
      alert('❌ Aggiungi almeno un\'annotazione prima di usare Recall Mode');
      return;
    }

    setViewMode('recall');
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  };

  const handleRecallComplete = (results: RecallResults) => {
    // Salva sessione
    const session = {
      id: generateSessionId(),
      palaceId: currentPalace!._id,
      startTime: new Date(Date.now() - results.duration),
      endTime: new Date(),
      mode: 'sequential' as const,
      results,
    };

    saveRecallSession(session);
    setLastRecallResults(results);

    // Mostra celebrazione se accuratezza >= 80%
    if (results.accuracy >= 80) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }

    // Torna alla view normale
    setViewMode('explorer');
  };

  const handleViewStats = () => {
    if (!currentPalace) {
      alert('❌ Seleziona un palazzo per vedere le statistiche');
      return;
    }
    setViewMode('stats');
    setRightSidebarOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Caricamento palazzi...</p>
        </div>
      </div>
    );
  }

  // 🆕 Render Recall Mode
  if (viewMode === 'recall' && currentPalace) {
    return (
      <RecallMode
        palace={currentPalace}
        onClose={() => setViewMode('explorer')}
        onComplete={handleRecallComplete}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 🆕 Celebration Banner */}
      {showCelebration && lastRecallResults && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Ottimo lavoro!</p>
              <p className="text-sm">{lastRecallResults.accuracy.toFixed(0)}% di accuratezza</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Memorium</h1>
            </div>

            {/* 🆕 Palace Info Badge */}
            {currentPalace && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">{currentPalace.name}</span>
                <span className="text-xs text-blue-600">•</span>
                <span className="text-xs text-blue-700">{totalAnnotations} note</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 🆕 Stats Button */}
            {currentPalace && (
              <button
                onClick={handleViewStats}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'stats'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">Statistiche</span>
              </button>
            )}

            {/* Tutorial */}
            <button
              onClick={() => setShowTutorial(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">Tutorial</span>
            </button>

            {/* 🆕 Recall Mode Button - MIGLIORATO */}
            <button
              onClick={handleStartRecall}
              disabled={!currentPalace || totalAnnotations === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium shadow-sm ${
                !currentPalace || totalAnnotations === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
              }`}
            >
              <Target className="w-5 h-5" />
              <span className="hidden sm:inline">Recall Mode</span>
            </button>

            {/* New Palace */}
            <button
              onClick={() => setShowPalaceCreation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuovo</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SettingsIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-80 bg-white border-r border-gray-200 shadow-lg lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">I Miei Palazzi</h2>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <PalaceList />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{palaces.length} palazzo/i</span>
              </div>
              {currentPalace && (
                <div className="text-xs text-gray-600">
                  Selezionato: {currentPalace.images.length} immagini
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative bg-gray-900">
          {currentPalace ? (
            viewMode === 'explorer' ? (
              <PalaceViewer palace={currentPalace} />
            ) : null
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-8">
                <div className="mb-6">
                  <div className="relative inline-block">
                    <Brain className="w-24 h-24 text-blue-400 mx-auto mb-4 opacity-50" />
                    <Zap className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Benvenuto in Memorium!
                  </h2>
                  <p className="text-gray-300 mb-8 text-lg">
                    Crea il tuo primo palazzo della memoria per iniziare a memorizzare 
                    informazioni in modo 10x più efficace.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowPalaceCreation(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-xl text-lg"
                  >
                    <Plus className="w-6 h-6" />
                    Crea il Tuo Primo Palazzo
                  </button>

                  <button
                    onClick={() => setShowTutorial(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium backdrop-blur-sm"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Guarda il Tutorial
                  </button>
                </div>

                {/* 🆕 Feature Highlights */}
                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                    <Eye className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">360° Explorer</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">Recall Mode</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">AI Generator</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">Progress Stats</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-blue-200 mb-1 font-medium">💡 Lo sapevi?</p>
                  <p className="text-xs text-blue-100">
                    La tecnica dei loci è usata dai campioni di memoria per ricordare 
                    migliaia di informazioni. Con Memorium puoi farlo anche tu!
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        {currentPalace && (
          <aside
            className={`
              fixed lg:static inset-y-0 right-0 z-40
              w-80 bg-white border-l border-gray-200 shadow-lg lg:shadow-none
              transform transition-transform duration-300 ease-in-out
              ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {viewMode === 'stats' ? (
                    <>
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Statistiche</h2>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Annotazioni</h2>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle View Button */}
                  <button
                    onClick={() => setViewMode(viewMode === 'stats' ? 'explorer' : 'stats')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={viewMode === 'stats' ? 'Mostra Annotazioni' : 'Mostra Statistiche'}
                  >
                    {viewMode === 'stats' ? (
                      <Brain className="w-5 h-5 text-gray-600" />
                    ) : (
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setRightSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {viewMode === 'stats' ? (
                  <RecallStatsView palace={currentPalace} />
                ) : (
                  <AnnotationList palace={currentPalace} />
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Modals */}
      {showOnboarding && (
        <Onboarding 
          isTutorialMode={false}
          onComplete={handleOnboardingComplete} 
          onSkip={handleOnboardingSkip} 
        />
      )}

      {showTutorial && (
        <Onboarding 
          isTutorialMode={true}
          onComplete={() => setShowTutorial(false)} 
          onSkip={() => setShowTutorial(false)} 
        />
      )}

      {showPalaceCreation && (
        <PalaceCreationChoice 
          isOpen={showPalaceCreation}
          onClose={() => setShowPalaceCreation(false)} 
        />
      )}

      {isSettingsOpen && (
        <Settings onClose={() => setSettingsOpen(false)} />
      )}

      {/* Mobile Overlay */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      )}

      {/* 🆕 Quick Action Floating Button (Mobile) */}
      {currentPalace && !leftSidebarOpen && !rightSidebarOpen && (
        <button
          onClick={handleStartRecall}
          disabled={totalAnnotations === 0}
          className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}