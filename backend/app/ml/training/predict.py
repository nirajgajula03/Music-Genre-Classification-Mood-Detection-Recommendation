import os, json, numpy as np, librosa, tensorflow as tf
from app.ml.training.config import *

class GenrePredictor:
    def __init__(self):
        with open(LABEL_ENCODER) as f: self.genres = json.load(f)["genres"]
        norm_path = os.path.join(os.path.dirname(MODEL_PATH), "norm_stats.json")
        if os.path.exists(norm_path):
            with open(norm_path) as f: d = json.load(f)
            self.mean, self.std = d["mean"], d["std"]
        else: self.mean, self.std = 0.0, 1.0
        self.model = tf.keras.models.load_model(MODEL_PATH)
        print(f"[predictor] Loaded model from {MODEL_PATH}")

    def _mel(self, y):
        if len(y) < SAMPLES_PER_SEG: y = np.pad(y, (0, SAMPLES_PER_SEG - len(y)))
        mel = librosa.feature.melspectrogram(y=y, sr=SAMPLE_RATE, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS)
        mel_db = librosa.power_to_db(mel, ref=np.max)
        if mel_db.shape[1] < N_FRAMES: mel_db = np.pad(mel_db, ((0,0),(0, N_FRAMES - mel_db.shape[1])))
        else: mel_db = mel_db[:, :N_FRAMES]
        return (mel_db.astype(np.float32) - self.mean) / self.std

    def predict(self, file_path, top_k=3):
        y, _ = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
        n_segs = max(1, len(y) // SAMPLES_PER_SEG)
        segments = [self._mel(y[i*SAMPLES_PER_SEG:(i+1)*SAMPLES_PER_SEG]) for i in range(n_segs)]
        X = np.stack(segments)[..., np.newaxis]
        probs = self.model.predict(X, verbose=0).mean(axis=0)
        order = np.argsort(probs)[::-1]
        top = [(self.genres[i], float(probs[i])) for i in order[:top_k]]
        return {"genre": top[0][0], "confidence": top[0][1], "top_k": top,
                "probabilities": {g: float(p) for g, p in zip(self.genres, probs)}}
