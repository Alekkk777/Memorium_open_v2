// pages/index.tsx - Landing Page Moderna
import { useRouter } from 'next/router';
import { Brain, Image as ImageIcon, Sparkles, Download, Github } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "Immagini 360°",
      description: "Carica le tue foto panoramiche e crea ambienti immersivi per memorizzare informazioni"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Metodo dei Loci",
      description: "Utilizza la tecnica del Palazzo della Memoria per ricordare meglio e più a lungo"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Integrata (opzionale)",
      description: "Genera automaticamente immagini mentali dai tuoi appunti con l'intelligenza artificiale"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "100% Locale",
      description: "I tuoi dati rimangono nel tuo browser. Nessun server, nessun account, massima privacy"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Memorium</h1>
        </div>
        
        <a
          href="https://github.com/yourusername/memorium"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Il tuo Palazzo della Memoria
          <br />
          <span className="text-blue-600">con AI</span>
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Converti i tuoi appunti in immagini mentali e memorizza grazie alla tecnica dei loci.
          Tutto funziona nel tuo browser, senza bisogno di account.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push('/userhome')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Inizia Gratis
          </button>
          
          <button
            onClick={() => {
              const element = document.getElementById('features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
          >
            Scopri di più
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Nessuna registrazione richiesta • Privacy totale • Salvataggio locale
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Perché Memorium?
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h4>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Come funziona
          </h3>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Crea il tuo palazzo</h4>
                <p className="text-gray-600">
                  Carica foto panoramiche 360° dei tuoi ambienti preferiti (casa, ufficio, luoghi visitati)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Aggiungi annotazioni</h4>
                <p className="text-gray-600">
                  Posiziona le tue informazioni da memorizzare come punti 3D nell'ambiente
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Esplora e memorizza</h4>
                <p className="text-gray-600">
                  Naviga nel tuo palazzo in 3D e rivedi le informazioni nel loro contesto spaziale
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-6 text-gray-900">
          Pronto a potenziare la tua memoria?
        </h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Inizia subito a costruire il tuo palazzo della memoria. Nessuna installazione richiesta.
        </p>
        <button
          onClick={() => router.push('/userhome')}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl text-lg"
        >
          Apri Memorium
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">
            Memorium è open source e gratuito
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="https://github.com/yourusername/memorium" className="hover:text-white">
              GitHub
            </a>
            <span>•</span>
            <a href="mailto:memorium.ai@gmail.com" className="hover:text-white">
              Contact
            </a>
            <span>•</span>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            2025 Memorium. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}