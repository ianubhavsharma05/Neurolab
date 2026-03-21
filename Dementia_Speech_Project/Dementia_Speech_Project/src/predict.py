import os
import librosa
import numpy as np
import joblib

# --- CONFIGURATION ---
# Use the exact path to your saved model
MODEL_PATH = r"C:\Users\ianub\Documents\Dementia_Speech_Project\Dementia_Speech_Project\models\speech_model.pkl"

def extract_features_for_prediction(file_path):
    
    try:
        # 1. Load & Trim
        audio, sr = librosa.load(file_path, duration=10)
        audio, _ = librosa.effects.trim(audio)
        
        # 2. Hesitation (Speech-to-Silence)
        intervals = librosa.effects.split(audio, top_db=20)
        speech_feat = np.array([i[1] - i[0] for i in intervals])
        speech_ratio = np.sum(speech_feat) / len(audio) if len(audio) > 0 else 0
        
        # 3. Pitch Instability
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch_values = pitches[pitches > 0]
        pitch_instability = np.std(pitch_values) if len(pitch_values) > 0 else 0
        
        # 4. MFCCs (13)
        mfccs = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13).T, axis=0)
        
        # 5. Spectral Centroid
        centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))

        # Stack them exactly as we did in training
        return np.hstack([mfccs, speech_ratio, pitch_instability, centroid])
    except Exception as e:
        print(f"Error processing file: {e}")
        return None

if __name__ == "__main__":
    # 1. Load the trained Pipeline (which includes the Scaler)
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found at {MODEL_PATH}. Run train.py first!")
    else:
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully.")

        # 2. Get the test file path
        # You can paste the path to a .wav file here
        test_file = input("🎤 Drag and drop your .wav file here or type the path: ").strip('"')

        if os.path.exists(test_file):
            print("🔍 Analyzing voice patterns...")
            raw_features = extract_features_for_prediction(test_file)
            
            if raw_features is not None:
                # Reshape for a single sample (1, -1)
                features = raw_features.reshape(1, -1)
                
                # 3. Get Probability and Final Guess
                prob = model.predict_proba(features)[0]
                prediction = model.predict(features)[0]

                print("\n" + "="*40)
                if prediction == 1:
                    print(f"🚩 RESULT: ATYPICAL (DEMENTIA PATTERN)")
                else:
                    print(f"✨ RESULT: TYPICAL (HEALTHY PATTERN)")
                
                print(f"📊 Model Confidence: {max(dementia_prob, healthy_prob):.2f}%")
                print("-" * 40)
                print("FEATURE ANALYSIS SUMMARY:")
                print(f"• MFCC-1 (Energy):       {raw_features[0]:.2f}")
                print(f"• Hesitation Ratio:     {raw_features[13]:.4f} (Avg: 0.15-0.25)")
                print(f"• Pitch Instability:    {raw_features[14]:.2f} Hz")
                print(f"• Spectral Centroid:    {raw_features[15]:.2f} Hz")
                print("-" * 40)
                print(f"Probabilities: Dementia {dementia_prob:.1f}% | Healthy {healthy_prob:.1f}%")
                print("="*40)
        else:
            print("❌ File path does not exist.")