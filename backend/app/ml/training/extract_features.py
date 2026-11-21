import os, numpy as np, librosa
from tqdm import tqdm
from app.ml.training.config import *

def _mel_segment(y):
    if len(y) < SAMPLES_PER_SEG: y = np.pad(y, (0, SAMPLES_PER_SEG - len(y)))
    mel = librosa.feature.melspectrogram(y=y, sr=SAMPLE_RATE, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    if mel_db.shape[1] < N_FRAMES: mel_db = np.pad(mel_db, ((0,0),(0, N_FRAMES - mel_db.shape[1])))
    else: mel_db = mel_db[:, :N_FRAMES]
    return mel_db.astype(np.float32)

def extract_all(force=False):
    if os.path.exists(FEATURES_CACHE) and not force:
        data = np.load(FEATURES_CACHE); return data["X"], data["y"]
    X, y = [], []
    for genre_idx, genre in enumerate(GENRES):
        genre_dir = os.path.join(GTZAN_ROOT, genre)
        if not os.path.isdir(genre_dir): print(f"[skip] Missing: {genre_dir}"); continue
        files = sorted(f for f in os.listdir(genre_dir) if f.lower().endswith(".wav"))
        for fname in tqdm(files, desc=f"{genre:10s}"):
            path = os.path.join(genre_dir, fname)
            try: y_full, _ = librosa.load(path, sr=SAMPLE_RATE, mono=True)
            except Exception as e: print(f"\n[skip] Corrupt: {path} ({e})"); continue
            total = SEGMENTS_PER_TRACK * SAMPLES_PER_SEG
            if len(y_full) < total: y_full = np.pad(y_full, (0, total - len(y_full)))
            for seg in range(SEGMENTS_PER_TRACK):
                start = seg * SAMPLES_PER_SEG
                X.append(_mel_segment(y_full[start:start+SAMPLES_PER_SEG])); y.append(genre_idx)
    X = np.stack(X)[..., np.newaxis]; y = np.array(y, dtype=np.int32)
    os.makedirs(os.path.dirname(FEATURES_CACHE), exist_ok=True)
    np.savez_compressed(FEATURES_CACHE, X=X, y=y)
    print(f"[done] {X.shape[0]} segments -> {FEATURES_CACHE}")
    return X, y

if __name__ == "__main__": extract_all(force=True)
