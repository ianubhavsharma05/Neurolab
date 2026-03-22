const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log(`[API] Initialized with Base URL: ${API_BASE_URL}`);

export const uploadMRI = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-mri`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `MRI analysis failed (${response.status})`);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('[API] MRI Upload Error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
      throw new Error('Server unreachable. If using Render Free, it may be waking up - please wait 30 seconds and try again.');
    }
    throw error;
  }
};

export const uploadSpeech = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.wav');
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-speech`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Speech analysis failed (${response.status})`);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('[API] Speech Upload Error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Server unreachable. If using Render Free, it may be waking up - please wait 30 seconds and try again.');
    }
    throw error;
  }
};

export const getOverallRisk = async (mriScore: number, speechScore: number, cognitiveScore: number) => {
  try {
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
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Risk calculation failed (${response.status})`);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('[API] Risk Calculation Error:', error);
    throw error;
  }
};
