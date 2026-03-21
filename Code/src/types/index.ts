export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface MRIResult {
  id: string;
  userId: string;
  date: string;
  precisionScore: number;
  modelAccuracy: number | null;
  classification: string;
  imageUrl: string | null;
  heatmapData: any[];
  findings: string[];
  metadata?: any;
}

export interface SpeechResult {
  id: string;
  userId: string;
  date: string;
  precisionScore: number;
  modelAccuracy: number | null;
  classification: string;
  features: {
    jitter: number | null;
    shimmer: number | null;
    spectralCentroid: number | null;
    zeroCrossingRate?: number | null;
    rmsEnergy?: number | null;
    pitch: number | null;
    pauseDuration?: number | null;
    hesitation_ratio?: number | null;
  };
  transcript: string | null;
  waveformData?: number[];
}

export interface CognitiveTestResult {
  id: string;
  userId: string;
  date: string;
  memoryRecall: { score: number; wordsShown: string[]; wordsRecalled: string[] };
  reactionTime: { averageMs: number; trials: number[] };
  verbalFluency: { score: number; words: string[]; duration: number };
  overallScore: number;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  date: string;
  mriScore: number;
  speechScore: number;
  cognitiveScore: number;
  overallRisk: number;
  precisionScore: number;
  classification: 'Low' | 'Moderate' | 'High';
  explanations: { feature: string; importance: number; description: string }[];
}

export interface HistoricalData {
  date: string;
  overallRisk: number;
  mriScore: number;
  speechScore: number;
  cognitiveScore: number;
}
