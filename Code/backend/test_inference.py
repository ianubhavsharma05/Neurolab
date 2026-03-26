import joblib
import numpy as np
import os
import sys

SPEECH_MODEL_PATH = "models/speech_model.pkl"

if not os.path.exists(SPEECH_MODEL_PATH):
    print("Error: models/speech_model.pkl not found")
    sys.exit(1)

try:
    model = joblib.load(SPEECH_MODEL_PATH)
    print("Model loaded successfully.")
    
    # Generate dummy features (16 features total as per extract_speech_features in main.py)
    # 13 MFCCs + speech_ratio + pitch_instable + centroid = 16
    dummy_features = np.zeros((1, 16))
    
    # Try a prediction
    prediction = model.predict(dummy_features)
    probs = model.predict_proba(dummy_features)
    
    print(f"Prediction result: {prediction[0]}")
    print(f"Probabilities: {probs[0].tolist()}")
    print("SUCCESS: The speech model is functional and making predictions.")

except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
