import os, json, numpy as np, librosa, tensorflow as tf
from app.ml.training.mood_config import *

class MoodPredictor:
    def __init__(self):
        with open(MOOD_ENCODER) as f: self.moods = json.load(f)["moods"]
        norm_path = os.path.join(os.path.dirname(MOOD_MODEL), "mood_norm_stats.json")
        if os.path.exists(norm_path):
            with open(norm_path) as f: d = json.load(f)
            self.mean, self.std = d["mean"], d["std"]
        else: self.mean, self.std = 0.0, 1.0
        self.model = tf.keras.models.load_model(MOOD_MODEL)
        print(f"[mood-predictor] Loaded model from {MOOD_MODEL}")

    def _mel(self, y):
        if len(y) < SAMPLES_PER_SEG: y = np.pad(y, (0, SAMPLES_PER_SEG - len(y)))
        mel = librosa.feature.melspectrogram(y=y, sr=SAMPLE_RATE, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS)
        mel_db = librosa.power_to_db(mel, ref=np.max)
        if mel_db.shape[1] < N_FRAMES: mel_db = np.pad(mel_db, ((0,0),(0, N_FRAMES - mel_db.shape[1])))
        else: mel_db = mel_db[:, :N_FRAMES]
        return (mel_db.astype(np.float32) - self.mean) / self.std

    def predict(self, file_path):
        y, _ = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
        n_segs = max(1, len(y) // SAMPLES_PER_SEG)
        segs = [self._mel(y[i*SAMPLES_PER_SEG:(i+1)*SAMPLES_PER_SEG]) for i in range(n_segs)]
        X = np.stack(segs)[..., np.newaxis]
        probs = self.model.predict(X, verbose=0).mean(axis=0)
        idx = int(np.argmax(probs))
        return {"mood": self.moods[idx], "confidence": float(probs[idx]),
                "probabilities": {m: float(p) for m, p in zip(self.moods, probs)}}
