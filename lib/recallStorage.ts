// lib/recallStorage.ts - Storage per Recall Mode

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

const RECALL_SESSIONS_KEY = 'memorium_recall_sessions';
const RECALL_STATS_KEY = 'memorium_recall_stats';

export function saveRecallSession(session: RecallSession): void {
  const sessions = getRecallSessions();
  sessions.push(session);
  
  const recentSessions = sessions.slice(-100);
  localStorage.setItem(RECALL_SESSIONS_KEY, JSON.stringify(recentSessions));
  
  updateRecallStats(session);
}

export function getRecallSessions(): RecallSession[] {
  try {
    const data = localStorage.getItem(RECALL_SESSIONS_KEY);
    if (!data) return [];
    
    const sessions = JSON.parse(data);
    return sessions.map((s: any) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : null,
    }));
  } catch {
    return [];
  }
}

export function getRecallSessionsByPalace(palaceId: string): RecallSession[] {
  return getRecallSessions().filter(s => s.palaceId === palaceId);
}

function updateRecallStats(session: RecallSession): void {
  if (!session.results) return;
  
  const stats = getRecallStats(session.palaceId);
  const { results } = session;
  
  stats.totalSessions++;
  stats.totalAnnotationsStudied += results.totalAnnotations;
  
  const oldTotal = stats.averageAccuracy * (stats.totalSessions - 1);
  stats.averageAccuracy = (oldTotal + results.accuracy) / stats.totalSessions;
  
  if (results.accuracy > stats.bestAccuracy) {
    stats.bestAccuracy = results.accuracy;
  }
  
  stats.lastSessionDate = session.endTime || new Date();
  stats.improvementTrend = calculateImprovementTrend(session.palaceId);
  
  saveRecallStats(session.palaceId, stats);
}

function calculateImprovementTrend(palaceId: string): number {
  const sessions = getRecallSessionsByPalace(palaceId)
    .filter(s => s.results !== null)
    .slice(-5);
  
  if (sessions.length < 2) return 0;
  
  const firstAccuracy = sessions[0].results!.accuracy;
  const lastAccuracy = sessions[sessions.length - 1].results!.accuracy;
  
  return ((lastAccuracy - firstAccuracy) / firstAccuracy) * 100;
}

export function getRecallStats(palaceId: string): RecallStats {
  try {
    const data = localStorage.getItem(`${RECALL_STATS_KEY}_${palaceId}`);
    if (!data) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        lastSessionDate: null,
        totalAnnotationsStudied: 0,
        weakestAnnotations: [],
        strongestAnnotations: [],
        improvementTrend: 0,
      };
    }
    
    const stats = JSON.parse(data);
    return {
      ...stats,
      lastSessionDate: stats.lastSessionDate ? new Date(stats.lastSessionDate) : null,
    };
  } catch {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      lastSessionDate: null,
      totalAnnotationsStudied: 0,
      weakestAnnotations: [],
      strongestAnnotations: [],
      improvementTrend: 0,
    };
  }
}

function saveRecallStats(palaceId: string, stats: RecallStats): void {
  localStorage.setItem(`${RECALL_STATS_KEY}_${palaceId}`, JSON.stringify(stats));
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}