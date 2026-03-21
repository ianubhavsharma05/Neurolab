import gradio as gr
import librosa
import numpy as np
import joblib
import os

# --- LOAD MODEL ---
MODEL_PATH = r"C:\Users\ianub\Documents\Dementia_Speech_Project\Dementia_Speech_Project\models\speech_model.pkl"
model = joblib.load(MODEL_PATH)

def predict_dementia(audio_path):
    if audio_path is None:
        return "Please upload an audio file."
    
    try:
        # 1. Feature Extraction (Matching your training logic)
        audio, sr = librosa.load(audio_path, duration=10)
        audio, _ = librosa.effects.trim(audio)
        
        # Hesitation Ratio
        intervals = librosa.effects.split(audio, top_db=20)
        speech_feat = np.array([i[1] - i[0] for i in intervals])
        speech_ratio = np.sum(speech_feat) / len(audio) if len(audio) > 0 else 0
        
        # Pitch Instability
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch_values = pitches[pitches > 0]
        pitch_instability = np.std(pitch_values) if len(pitch_values) > 0 else 0
        
        # MFCCs
        mfccs = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13).T, axis=0)
        
        # Spectral Centroid
        centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))

        features = np.hstack([mfccs, speech_ratio, pitch_instability, centroid]).reshape(1, -1)
        
        # 2. Prediction
        probs = model.predict_proba(features)[0]
        
        # Return results as a dictionary for the Gradio Label component
        return {
            "Healthy Pattern": float(probs[0]),
            "Dementia Pattern": float(probs[1])
        }
    except Exception as e:
        return f"Error: {str(e)}"

# --- BUILD UI ---
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🧠 Dementia Speech Analysis Tool")
    gr.Markdown("Upload a .wav file to analyze vocal biomarkers associated with cognitive health.")
    
    with gr.Row():
        audio_input = gr.Audio(type="filepath", label="Upload Patient Audio")
        result_output = gr.Label(label="Analysis Result")
    
    analyze_btn = gr.Button("🔍 Run Diagnostic Analysis", variant="primary")
    analyze_btn.click(fn=predict_dementia, inputs=audio_input, outputs=result_output)

demo.launch()