const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const uploadMRI = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/analyze-mri`, {
    method: 'POST',
    body: formData,
  }).catch(() => {
    throw new Error('Network error: Could not connect to the server');
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'MRI analysis failed');
  }
  
  return response.json();
};

export const uploadSpeech = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.wav');
  
  const response = await fetch(`${API_BASE_URL}/analyze-speech`, {
    method: 'POST',
    body: formData,
  }).catch(() => {
    throw new Error('Network error: Could not connect to the server');
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Speech analysis failed');
  }
  
  return response.json();
};

export const getOverallRisk = async (mriScore: number, speechScore: number, cognitiveScore: number) => {
  const response = await fetch(`${API_BASE_URL}/calculate-risk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mri_score: mriScore,
      speech_score: speechScore,
      cognitive_score: cognitiveScore,
    }),
  }).catch(() => {
    throw new Error('Network error: Could not connect to the server');
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Risk assessment calculation failed');
  }
  
  return response.json();
};
