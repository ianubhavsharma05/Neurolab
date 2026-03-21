import { MRIResult, SpeechResult, CognitiveTestResult, RiskAssessment, HistoricalData } from '@/types';

const getKey = (prefix: string, userId: string) => `neurosense_${prefix}_${userId}`;

export const dataStore = {
  saveMRIResult: (userId: string, result: MRIResult) => {
    const key = getKey('mri', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(result);
    localStorage.setItem(key, JSON.stringify(existing));
  },
  getMRIResults: (userId: string): MRIResult[] => {
    return JSON.parse(localStorage.getItem(getKey('mri', userId)) || '[]');
  },
  saveSpeechResult: (userId: string, result: SpeechResult) => {
    const key = getKey('speech', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(result);
    localStorage.setItem(key, JSON.stringify(existing));
  },
  getSpeechResults: (userId: string): SpeechResult[] => {
    return JSON.parse(localStorage.getItem(getKey('speech', userId)) || '[]');
  },
  saveCognitiveResult: (userId: string, result: CognitiveTestResult) => {
    const key = getKey('cognitive', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(result);
    localStorage.setItem(key, JSON.stringify(existing));
  },
  getCognitiveResults: (userId: string): CognitiveTestResult[] => {
    return JSON.parse(localStorage.getItem(getKey('cognitive', userId)) || '[]');
  },
  saveRiskAssessment: (userId: string, assessment: RiskAssessment) => {
    const key = getKey('risk', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(assessment);
    localStorage.setItem(key, JSON.stringify(existing));
  },
  getRiskAssessments: (userId: string): RiskAssessment[] => {
    return JSON.parse(localStorage.getItem(getKey('risk', userId)) || '[]');
  },
  getHistoricalData: (userId: string): HistoricalData[] => {
    const risks = JSON.parse(localStorage.getItem(getKey('risk', userId)) || '[]') as RiskAssessment[];
    return risks.map(r => ({
      date: r.date,
      overallRisk: r.overallRisk,
      mriScore: r.mriScore,
      speechScore: r.speechScore,
      cognitiveScore: r.cognitiveScore,
    }));
  },
};
