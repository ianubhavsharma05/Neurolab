// --- THE API BRIDGE ---
// This file acts as the translator between your React interface and your Python backend server.

// VITE_API_URL: This is the web address of your Python server (Render or Railway).
// If the environment variable isn't set, it failsafe-defaults to your local computer (localhost:8000).
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log(`[API] Initialized with Base URL: ${API_BASE_URL}`);

/**
 * --- UTILITY: checkServerStatus ---
 * PURPOSE: Since we use Free Tiers (Render/Railway), the server sleeps during inactivity.
 * This pings the /health endpoint to "wake it up" before the user starts a heavy 10-second analysis.
 */
export const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * FUNCTION: uploadMRI
 * Takes: A physical brain image file from the user's computer.
 * Action: Packages it into a 'FormData' format (which browsers use to send files) and sends it to the /analyze-mri endpoint.
 */
export const uploadMRI = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // We 'fetch' (send a request) to our Python server. 
    const response = await fetch(`${API_BASE_URL}/analyze-mri`, {
      method: 'POST',
      body: formData,
    });
    
    // Error Handling: If the server says "404" or "500", we throw a readable error tip to the user.
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `MRI analysis failed (${response.status})`);
    }
    
    // Converts the server's raw signal (JSON) back into readable results for the screen.
    return response.json();
  } catch (error: any) {
    console.error('[API] MRI Upload Error:', error);
    // SPECIAL FALLSAFE: If the backend is on a "Free Tier" (Render), it might be "sleeping". 
    // We detect this and tell the user to wait a moment.
    if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
      throw new Error('Server unreachable. If using Render Free, it may be waking up - please wait 30 seconds and try again.');
    }
    throw error;
  }
};

/**
 * FUNCTION: uploadSpeech
 * Takes: A recorded audio Blob (True WAV) from the SpeechAnalysis screen.
 */
export const uploadSpeech = async (audioBlob: Blob) => {
  const formData = new FormData();
  // We explicitly name it 'speech.wav' so the Python server knows to treat it as audio.
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

/**
 * FUNCTION: getOverallRisk
 * Uses the mathematical ensemble calculation to merge Scores from all three modules.
 */
export const getOverallRisk = async (mriScore: number, speechScore: number, cognitiveScore: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate-risk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // We send the three scores as a JSON package.
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
