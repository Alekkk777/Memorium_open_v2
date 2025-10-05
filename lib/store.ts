// lib/store.ts - Zustand Store con sicurezza integrata
import { create } from 'zustand';
import { Palace, PalaceImage, Annotation } from '@/types';
import { imageDB } from './imageDB';
import { saveSecurePalaces, loadSecurePalaces } from './security';

const STORAGE_KEY = 'memorium_palaces';
const VERSION = '2.0.0';

// Palace Store
interface PalaceStore {
  palaces: Palace[];
  currentPalaceId: string | null;
  currentImageIndex: number;
  isLoading: boolean;

  // Palace Actions
  loadPalaces: () => Promise<void>;
  savePalaces: () => Promise<void>;
  addPalace: (palace: Omit<Palace, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deletePalace: (id: string) => Promise<void>;
  updatePalace: (id: string, updates: Partial<Palace>) => void;
  setCurrentPalace: (id: string | null) => void;
  setCurrentImage: (index: number) => void;

  // Annotation Actions
  addAnnotation: (palaceId: string, imageId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  deleteAnnotation: (palaceId: string, imageId: string, annotationId: string) => Promise<void>;
  updateAnnotation: (palaceId: string, imageId: string, annotationId: string, updates: Partial<Annotation>) => void;
}

export const usePalaceStore = create<PalaceStore>((set, get) => ({
  palaces: [],
  currentPalaceId: null,
  currentImageIndex: 0,
  isLoading: false,

  // Load palaces with encryption support
  loadPalaces: async () => {
    set({ isLoading: true });
    try {
      const isEncrypted = localStorage.getItem('memorium_encrypted') === 'true';
      
      if (isEncrypted) {
        // Richiedi password
        let password: string | null = null;
        let attempts = 0;
        
        while (attempts < 3) {
          password = prompt(
            attempts === 0 
              ? 'Inserisci la password per accedere ai tuoi dati:' 
              : `Password errata. Tentativi rimasti: ${3 - attempts}`
          );
          
          if (!password) {
            set({ palaces: [], isLoading: false });
            return;
          }
          
          try {
            const palaces = await loadSecurePalaces(password);
            set({ palaces, isLoading: false });
            console.log('✅ Palaces loaded (encrypted):', palaces.length);
            return;
          } catch (error) {
            attempts++;
            if (attempts >= 3) {
              alert('Troppi tentativi falliti. Ricarica la pagina per riprovare.');
              set({ palaces: [], isLoading: false });
              return;
            }
          }
        }
      } else {
        // Caricamento normale
        const palaces = await loadSecurePalaces();
        set({ palaces, isLoading: false });
        console.log('✅ Palaces loaded:', palaces.length);
      }
    } catch (error) {
      console.error('❌ Error loading palaces:', error);
      set({ palaces: [], isLoading: false });
    }
  },

  // Save palaces with encryption support
  savePalaces: async () => {
    try {
      const { palaces } = get();
      const isEncryptionEnabled = localStorage.getItem('memorium_encryption_enabled') === 'true';
      const isCurrentlyEncrypted = localStorage.getItem('memorium_encrypted') === 'true';
      
      if (isEncryptionEnabled || isCurrentlyEncrypted) {
        // Salvataggio criptato
        const password = sessionStorage.getItem('memorium_session_password');
        
        if (!password) {
          const newPassword = prompt('Inserisci la password per salvare:');
          if (!newPassword) {
            console.log('❌ Save cancelled - no password provided');
            return;
          }
          sessionStorage.setItem('memorium_session_password', newPassword);
          await saveSecurePalaces(palaces, newPassword);
        } else {
          await saveSecurePalaces(palaces, password);
        }
      } else {
        // Salvataggio normale
        await saveSecurePalaces(palaces);
      }
      
      console.log('💾 Palaces saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving palaces:', error);
    }
  },

  // Add new palace
  addPalace: async (palaceData) => {
    const newPalace: Palace = {
      ...palaceData,
      _id: `palace_${Date.now()}`, // SOLO _id
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      palaces: [...state.palaces, newPalace],
      currentPalaceId: newPalace._id,
      currentImageIndex: 0,
    }));

    await get().savePalaces();
  },

  // Delete palace
  deletePalace: async (id) => {
    const { palaces } = get();
    const palace = palaces.find(p => p._id === id);
    
    if (palace) {
      // Delete all images from IndexedDB
      for (const image of palace.images) {
        if (image.indexedDBKey) {
          await imageDB.deleteImage(image.indexedDBKey);
        }
        // Delete annotation images
        for (const annotation of image.annotations) {
          if (annotation.imageIndexedDBKey) {
            await imageDB.deleteImage(annotation.imageIndexedDBKey);
          }
        }
      }
    }

    set((state) => ({
      palaces: state.palaces.filter(p => p._id !== id),
      currentPalaceId: state.currentPalaceId === id ? null : state.currentPalaceId,
      currentImageIndex: state.currentPalaceId === id ? 0 : state.currentImageIndex,
    }));

    await get().savePalaces();
  },

  // Update palace
  updatePalace: (id, updates) => {
    set((state) => ({
      palaces: state.palaces.map(p =>
        p._id === id
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      ),
    }));
    get().savePalaces();
  },

  // Set current palace
  setCurrentPalace: (id) => {
    set({ currentPalaceId: id, currentImageIndex: 0 });
  },

  // Set current image
  setCurrentImage: (index) => {
    set({ currentImageIndex: index });
  },

  // Add annotation
  addAnnotation: (palaceId, imageId, annotationData) => {
    const newAnnotation: Annotation = {
      id: `ann_${Date.now()}`,
      ...annotationData,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      palaces: state.palaces.map(palace =>
        palace._id === palaceId
          ? {
              ...palace,
              images: palace.images.map(image =>
                image.id === imageId
                  ? {
                      ...image,
                      annotations: [...image.annotations, newAnnotation],
                    }
                  : image
              ),
              updatedAt: new Date(),
            }
          : palace
      ),
    }));

    get().savePalaces();
  },

  // Delete annotation
  deleteAnnotation: async (palaceId, imageId, annotationId) => {
    const { palaces } = get();
    const palace = palaces.find(p => p._id === palaceId);
    const image = palace?.images.find(i => i.id === imageId);
    const annotation = image?.annotations.find(a => a.id === annotationId);

    // Delete annotation image from IndexedDB if exists
    if (annotation?.imageIndexedDBKey) {
      await imageDB.deleteImage(annotation.imageIndexedDBKey);
    }

    set((state) => ({
      palaces: state.palaces.map(palace =>
        palace._id === palaceId
          ? {
              ...palace,
              images: palace.images.map(image =>
                image.id === imageId
                  ? {
                      ...image,
                      annotations: image.annotations.filter(a => a.id !== annotationId),
                    }
                  : image
              ),
              updatedAt: new Date(),
            }
          : palace
      ),
    }));

    await get().savePalaces();
  },

  // Update annotation
  updateAnnotation: (palaceId, imageId, annotationId, updates) => {
    set((state) => ({
      palaces: state.palaces.map(palace =>
        palace._id === palaceId
          ? {
              ...palace,
              images: palace.images.map(image =>
                image.id === imageId
                  ? {
                      ...image,
                      annotations: image.annotations.map(a =>
                        a.id === annotationId ? { ...a, ...updates } : a
                      ),
                    }
                  : image
              ),
              updatedAt: new Date(),
            }
          : palace
      ),
    }));
    get().savePalaces();
  },
}));

// UI Store
interface UIStore {
  isCreateModalOpen: boolean;
  isAnnotationFormOpen: boolean;
  isSettingsOpen: boolean;
  selectedAnnotationId: string | null;

  setCreateModalOpen: (open: boolean) => void;
  setAnnotationFormOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setSelectedAnnotation: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCreateModalOpen: false,
  isAnnotationFormOpen: false,
  isSettingsOpen: false,
  selectedAnnotationId: null,

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setAnnotationFormOpen: (open) => set({ isAnnotationFormOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setSelectedAnnotation: (id) => set({ selectedAnnotationId: id }),
}));