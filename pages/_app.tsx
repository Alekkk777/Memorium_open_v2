// pages/_app.tsx - PWA Setup senza Redux
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  // Registra Service Worker per PWA
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          // Controlla aggiornamenti
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available! Reload to update.');
                  if (confirm('Nuova versione disponibile! Ricaricare?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // Mostra prompt installazione PWA
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('💡 PWA installable!');
      
      // Puoi salvare questo evento per mostrare un pulsante custom
      // window.addEventListener('appinstalled', () => {
      //   console.log('✅ PWA installed!');
      // });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Detecta se l'app è già installata
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App running as PWA (standalone mode)');
    }
  }, []);

  return (
    <>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <title>Memorium - Memory Palace PWA</title>
        </Head>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;