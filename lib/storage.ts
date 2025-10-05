// lib/storage.ts - localStorage Manager CORRETTO
import { Palace } from '@/types';

const STORAGE_KEY = 'memorium_palaces';
const VERSION_KEY = 'memorium_version';
const CURRENT_VERSION = '2.0.0';

export class StorageManager {
  static savePalaces(palaces: Palace[]): void {
    try {
      const data = JSON.stringify(palaces);
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
      console.error('Error saving palaces to localStorage:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some palaces or export your data.');
      }
      throw error;
    }
  }

  static loadPalaces(): Palace[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const palaces = JSON.parse(data) as Palace[];
      
      return palaces.map(palace => ({
        ...palace,
        createdAt: new Date(palace.createdAt),
        updatedAt: new Date(palace.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading palaces from localStorage:', error);
      return [];
    }
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  }

  static hasData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  static getVersion(): string | null {
    return localStorage.getItem(VERSION_KEY);
  }

  static getStorageSize(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const total = 5 * 1024 * 1024;
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }

  static exportData(): string {
    const palaces = this.loadPalaces();
    const exportData = {
      version: CURRENT_VERSION,
      exportDate: new Date(),
      palaces
    };
    return JSON.stringify(exportData, null, 2);
  }

  static importData(jsonString: string): Palace[] {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.palaces || !Array.isArray(data.palaces)) {
        throw new Error('Invalid import data format');
      }

      const palaces = data.palaces.map((palace: any) => ({
        ...palace,
        createdAt: new Date(palace.createdAt),
        updatedAt: new Date(palace.updatedAt),
      }));

      return palaces;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid import file');
    }
  }
}

export const useStorageSync = (palaces: Palace[]) => {
  if (typeof window !== 'undefined') {
    StorageManager.savePalaces(palaces);
  }
};