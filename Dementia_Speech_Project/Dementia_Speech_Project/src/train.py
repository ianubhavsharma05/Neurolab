import os
import librosa
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# --- CONFIGURATION ---
BASE_DIR = r"C:\Users\ianub\Documents\Dementia_Speech_Project\Dementia_Speech_Project"
DATASET_PATH = os.path.join(BASE_DIR, "data", "raw")
MODEL_PATH = os.path.join(BASE_DIR, "models", "speech_model.pkl")

def extract_features(file_path):
    try:
        # 1. Load 10s of audio, trim silence from edges
        audio, sr = librosa.load(file_path, duration=10)
        audio, _ = librosa.effects.trim(audio)
        
        # 2. HESITATION FEATURE: Speech-to-Silence Ratio
        # top_db=20 is sensitive; it detects gaps between words
        intervals = librosa.effects.split(audio, top_db=20)
        speech_feat = np.array([i[1] - i[0] for i in intervals])
        speech_ratio = np.sum(speech_feat) / len(audio) if len(audio) > 0 else 0
        
        # 3. VOCAL TREMOR: Pitch Variation (F0)
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch_values = pitches[pitches > 0]
        pitch_instability = np.std(pitch_values) if len(pitch_values) > 0 else 0
        
        # 4. ACOUSTIC FINGERPRINT: MFCCs (13 standard coefficients)
        mfccs = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13).T, axis=0)
        
        # 5. COMPLEXITY: Spectral Centroid (Bright vs Dark voice)
        centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))

        # Combine: [13 MFCCs, 1 Ratio, 1 Pitch, 1 Centroid] = 16 features
        return np.hstack([mfccs, speech_ratio, pitch_instability, centroid])
    except Exception:
        return None

if __name__ == "__main__":
    features, labels = [], []
    categories = {"dementia": 1, "healthy": 0}

    print("🚀 Extracting Fluency & Pitch Features...")

    for cat, label in categories.items():
        cat_path = os.path.join(DATASET_PATH, cat)
        if not os.path.exists(cat_path): continue
            
        count = 0
        for root, dirs, files in os.walk(cat_path):
            for f in files:
                if f.endswith('.wav'):
                    print(f"🎙️  Analyzing Rhythm: {f[:15]}...", end="\r")
                    vec = extract_features(os.path.join(root, f))
                    if vec is not None:
                        features.append(vec)
                        labels.append(label)
                        count += 1
        print(f"\n✅ Extracted {count} samples from {cat.upper()}")

    if len(features) < 10:
        print("❌ Error: Not enough files found.")
    else:
        X, y = np.array(features), np.array(labels)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        # PIPELINE: Scaling + Gradient Boosting
        # Gradient Boosting builds trees one by one to correct previous errors
        model_pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', GradientBoostingClassifier(n_estimators=150, learning_rate=0.05, max_depth=4, random_state=42))
        ])

        print(f"\n🧠 Training Gradient Boosting Model on {len(X_train)} samples...")
        model_pipeline.fit(X_train, y_train)

        # Final Evaluation
        y_pred = model_pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        
        print("\n" + "⭐" * 15)
        print(f" FINAL ACCURACY: {acc:.2%}")
        print("⭐" * 15)
        print("\nClassification Details:")
        print(classification_report(y_test, y_pred, target_names=["Healthy", "Dementia"]))

        # Save model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(model_pipeline, MODEL_PATH)
        print(f"💾 Model saved to: {MODEL_PATH}")