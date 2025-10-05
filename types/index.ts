// types/index.ts - TIPI COMPLETI PER MEMORIUM V2

export interface Annotation {
  id: string;
  text: string;
  note: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  width: number;
  height: number;
  isVisible: boolean;
  selected: boolean;
  generatedImage?: string;
  imageFile?: File;
  imageUrl?: string; // URL immagine associata
  imageIndexedDBKey?: string; // Chiave IndexedDB per immagine
  aiPrompt?: string;
  createdAt: string;
  updatedAt?: string;
  isMandatory?: boolean;
  isImportant?: boolean;
  isGenerated?: boolean; // Se generata da AI
  recallData?: {
    attempts: number;
    lastAttempt: string | null;
    remembered: boolean | null;
  };
}

export interface PalaceImage {
  id: string;
  name: string;
  fileName: string;
  url?: string; // URL da IndexedDB
  dataUrl?: string; // Base64 string
  indexedDBKey?: string; // Chiave per IndexedDB
  contentType?: string;
  width: number;
  height: number;
  is360: boolean; // Se è panoramica 360°
  annotations: Annotation[];
  fromModel?: boolean;
  createdAt: string;
}

export interface Palace {
  _id: string; // SOLO _id per i palazzi
  name: string;
  description?: string;
  images: PalaceImage[];
  fromModel?: boolean;
  createdAt: Date;
  updatedAt: Date;
  recallStats?: {
    totalSessions: number;
    bestAccuracy: number;
    lastSessionDate: string | null;
  };
}

export interface UserSettings {
  openaiKey?: string;
  theme: 'light' | 'dark';
  autoSave: boolean;
  showTutorial: boolean;
  onboardingCompleted: boolean;
  recallSettings?: {
    defaultMode: 'sequential' | 'random' | 'weakest';
    showHints: boolean;
    autoProgressDelay: number;
  };
}

// ========== AI GENERATION TYPES ==========
export interface AIGenerationRequest {
  notesText: string;
  targetCount: number;
  imagesCount: number;
  language?: string;
}

export interface AIGeneratedAnnotation {
  description: string;
  note: string;
  imageIndex: number;
  mnemonicStrength?: number;
}

// ========== RECALL MODE TYPES ==========
export interface RecallSession {
  id: string;
  palaceId: string;
  startTime: Date;
  endTime: Date | null;
  mode: 'sequential' | 'random' | 'weakest';
  results: RecallResults | null;
}

export interface RecallResults {
  totalAnnotations: number;
  remembered: number;
  forgotten: number;
  skipped: number;
  accuracy: number;
  duration: number;
  annotationResults: AnnotationRecallResult[];
}

export interface AnnotationRecallResult {
  annotationId: string;
  imageIndex: number;
  remembered: boolean | null;
  attempts: number;
  timeSpent: number;
  hintUsed?: boolean;
}

export interface RecallStats {
  totalSessions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastSessionDate: Date | null;
  totalAnnotationsStudied: number;
  weakestAnnotations: string[];
  strongestAnnotations: string[];
  improvementTrend: number;
}

export interface RecallSettings {
  defaultMode: 'sequential' | 'random' | 'weakest';
  showHints: boolean;
  autoProgressDelay: number;
  targetAccuracy: number;
  reviewWeakAnnotations: boolean;
  streakNotifications: boolean;
}

export interface RecallProgress {
  palaceId: string;
  annotationId: string;
  imageIndex: number;
  remembered: boolean | null;
  attempts: number;
  lastAttempt: string | null;
}

// ========== EXPORT/IMPORT TYPES ==========
export interface ExportData {
  version: string;
  exportDate: string;
  palaces: Palace[];
}

export interface StandardPalaceMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  imageCount: number;
  annotationCount: number;
  imagesFolder: string;
}