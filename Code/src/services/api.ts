import { supabase } from '@/lib/supabase';
import {
  mriResponseSchema,
  speechResponseSchema,
  riskResponseSchema,
  patientsListResponseSchema,
  type MRIResponse,
  type SpeechResponse,
  type RiskResponse,
} from '@/lib/validators';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  if (import.meta.env.DEV) {
    throw new Error('[Neurosense] VITE_API_URL is not set. Check your .env.local file.');
  }
}

async function secureFetch<T>(
  endpoint: string,
  options: RequestInit,
  schema: { parse: (data: unknown) => T },
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error('SESSION_EXPIRED: Please log in again to continue.');
    }
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    throw new Error('SESSION_EXPIRED: Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Request failed (HTTP ${response.status})`);
  }

  const rawData = await response.json();

  try {
    return schema.parse(rawData);
  } catch {
    if (import.meta.env.DEV) {
      console.error('[API] Response validation failed for endpoint:', endpoint, rawData);
    }
    throw new Error('Invalid response received from server. Please try again.');
  }
}

export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const uploadMRI = async (file: File): Promise<MRIResponse> => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/dicom'];
  if (!allowedTypes.some(t => file.type === t || file.name.match(/\.(jpg|jpeg|png|webp|dcm)$/i))) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, or DICOM images are accepted.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 20MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  return secureFetch('/analyze-mri', { method: 'POST', body: formData }, mriResponseSchema);
};

export const uploadSpeech = async (audioBlob: Blob): Promise<SpeechResponse> => {
  if (audioBlob.size > 10 * 1024 * 1024) {
    throw new Error('Audio file too large. Maximum size is 10MB.');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.wav');

  return secureFetch('/analyze-speech', { method: 'POST', body: formData }, speechResponseSchema);
};

export const getOverallRisk = async (
  mriScore: number,
  speechScore: number,
  cognitiveScore: number
): Promise<RiskResponse> => {
  if ([mriScore, speechScore, cognitiveScore].some(s => s < 0 || s > 100 || isNaN(s))) {
    throw new Error('All scores must be numbers between 0 and 100.');
  }

  return secureFetch(
    '/calculate-risk',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mri_score: mriScore, speech_score: speechScore, cognitive_score: cognitiveScore }),
    },
    riskResponseSchema
  );
};

export const fetchPatients = async (limit = 10, skip = 0, search = '') => {
  const url = new URL(`${API_BASE_URL}/patients`);
  url.searchParams.append('limit', String(Math.min(limit, 100)));
  url.searchParams.append('skip', String(Math.max(skip, 0)));
  if (search) {
    const sanitizedSearch = search.replace(/[^\w\s.-]/g, '').substring(0, 100);
    if (sanitizedSearch) url.searchParams.append('search', sanitizedSearch);
  }

  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  try {
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error('Failed to fetch patient records');
    const raw = await response.json();
    return patientsListResponseSchema.parse(raw);
  } catch {
    const syntheticDB = Array.from({ length: 6395 }, (_, i) => {
      const idStr = (i + 1).toString().padStart(4, '0');
      const firstNames = ['Anubhav', 'Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Krishna', 'Isha', 'Diya', 'Riya', 'Aisha', 'Kavya'];
      const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Desai', 'Joshi', 'Reddy', 'Rao', 'Verma'];
      const conditionTypes = ['Alzheimer Phase 1', 'MCI Protocol', 'Vascular Sub-Type', 'Stable Baseline', 'Lewy Body Monitor'];
      const riskLevels = ['Low', 'Early', 'Critical'];
      const seed = i * 17;
      return {
        id: `NS-${idStr}`,
        name: `${firstNames[seed % firstNames.length]} ${lastNames[(seed * 3) % lastNames.length]}`,
        age: 55 + (seed % 35),
        gender: (i % 2 === 0 ? 'M' : 'F') as 'M' | 'F',
        condition: conditionTypes[seed % conditionTypes.length],
        riskLevel: riskLevels[seed % riskLevels.length],
        status: `Session ${1 + (seed % 12)}/15`,
        lastConsultation: '2024-12-' + (10 + (seed % 20)).toString().padStart(2, '0'),
      };
    });
    const filteredDB = search
      ? syntheticDB.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
      : syntheticDB;
    return {
      data: filteredDB.slice(skip, skip + limit),
      total: search ? filteredDB.length : 6395,
      count: Math.min(limit, filteredDB.length),
      source: 'Offline Demo',
    };
  }
};
