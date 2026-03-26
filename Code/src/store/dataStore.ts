// --- LOCAL DATA PERSISTENCE ---
// This file manages how we save your medical results locally on your own computer's browser.
// This ensures that if you refresh the page or come back tomorrow, your history is still there.

import { MRIResult, SpeechResult, CognitiveTestResult, RiskAssessment, HistoricalData } from '@/types';

/**
 * HELPER: getKey
 * Purpose: Generates a unique "locker key" for your data so it doesn't get mixed up with other websites.
 */
const getKey = (prefix: string, userId: string) => `neurosense_${prefix}_${userId}`;

export const dataStore = {
  // SAVING MRI RESULTS
  saveMRIResult: (userId: string, result: MRIResult) => {
    const key = getKey('mri', userId);
    // 1. Pull existing history from the browser's "LocalStorage" cupboard.
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    // 2. Add the NEW result into the list.
    existing.push(result);
    // 3. Shove it back into the cupboard as a text string (JSON).
    localStorage.setItem(key, JSON.stringify(existing));
  },
  
  getMRIResults: (userId: string): MRIResult[] => {
    return JSON.parse(localStorage.getItem(getKey('mri', userId)) || '[]');
  },

  // SAVING SPEECH RESULTS
  saveSpeechResult: (userId: string, result: SpeechResult) => {
    const key = getKey('speech', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(result);
    localStorage.setItem(key, JSON.stringify(existing));
  },

  getSpeechResults: (userId: string): SpeechResult[] => {
    return JSON.parse(localStorage.getItem(getKey('speech', userId)) || '[]');
  },

  // SAVING COGNITIVE TEST SCORES
  saveCognitiveResult: (userId: string, result: CognitiveTestResult) => {
    const key = getKey('cognitive', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(result);
    localStorage.setItem(key, JSON.stringify(existing));
  },

  getCognitiveResults: (userId: string): CognitiveTestResult[] => {
    return JSON.parse(localStorage.getItem(getKey('cognitive', userId)) || '[]');
  },

  // SAVING FINAL RISK ASSESSMENTS
  saveRiskAssessment: (userId: string, assessment: RiskAssessment) => {
    const key = getKey('risk', userId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(assessment);
    localStorage.setItem(key, JSON.stringify(existing));
  },

  getRiskAssessments: (userId: string): RiskAssessment[] => {
    return JSON.parse(localStorage.getItem(getKey('risk', userId)) || '[]');
  },

  /**
   * HISTORY TRENDS:
   * This pulls all your past Risk Assessments and filters just the scores.
   * We use this to draw the "Progress Charts" on the patient dashboard.
   */
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
