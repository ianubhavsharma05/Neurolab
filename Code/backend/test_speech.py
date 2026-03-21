import librosa
import numpy as np

def extract_speech_features(file_path):
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
    
    return np.hstack([mfccs, speech_ratio, pitch_instability, centroid])

# create a dummy wav file
import soundfile as sf
sf.write("dummy.wav", np.random.randn(22050), 22050)

print(extract_speech_features("dummy.wav"))
