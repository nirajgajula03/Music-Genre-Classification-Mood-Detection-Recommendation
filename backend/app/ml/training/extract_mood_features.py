import os, json, numpy as np, pandas as pd, librosa
from pathlib import Path
from sklearn.cluster import KMeans
from tqdm import tqdm
from app.ml.training.mood_config import *

def _mel_segment(y):
    if len(y) < SAMPLES_PER_SEG: y = np.pad(y, (0, SAMPLES_PER_SEG - len(y)))
    mel = librosa.feature.melspectrogram(y=y, sr=SAMPLE_RATE, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=N_MELS)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    if mel_db.shape[1] < N_FRAMES: mel_db = np.pad(mel_db, ((0,0),(0, N_FRAMES - mel_db.shape[1])))
    else: mel_db = mel_db[:, :N_FRAMES]
    return mel_db.astype(np.float32)

def _load_annotations():
    static_csv = DEAM_ANNO / "static_annotations_2.csv"
    if not static_csv.exists(): static_csv = DEAM_ANNO / "static_annotations.csv"
    df = pd.read_csv(static_csv)
    df.columns = [c.strip().lower().replace(" ","_") for c in df.columns]
    if "valence_mean" not in df.columns:
        df = df.rename(columns={df.columns[0]:"song_id", df.columns[1]:"valence_mean", df.columns[2]:"arousal_mean"})
    return df[["song_id","valence_mean","arousal_mean"]].dropna()

def _cluster_to_mood(centroids):
    v_med = float(np.median(centroids[:,0])); a_med = float(np.median(centroids[:,1]))
    labels = {i: None for i in range(NUM_MOODS)}
    def score(c, dv, da): return (c[0]-v_med)*dv + (c[1]-a_med)*da
    quadrants = [("happy",1,1),("angry",-1,1),("calm",1,-1),("sad",-1,-1),("energetic",0,1),("relaxing",0,-1)]
    used = set()
    for name, dv, da in quadrants:
        best, best_i = -1e9, None
        for i, c in enumerate(centroids):
            if i in used: continue
            s = score(c, dv, da)
            if s > best: best, best_i = s, i
        if best_i is not None: labels[best_i] = name; used.add(best_i)
    fallback = [m for m in MOODS if m not in labels.values()]
    for i in range(NUM_MOODS):
        if labels[i] is None and fallback: labels[i] = fallback.pop(0)
    return labels

def extract_all(force=False):
    if os.path.exists(MOOD_CACHE) and not force:
        d = np.load(MOOD_CACHE, allow_pickle=True)
        return d["X"], d["y"], d["song_ids"], d["cluster_map"].item()
    anno = _load_annotations()
    va = anno[["valence_mean","arousal_mean"]].values
    km = KMeans(n_clusters=NUM_MOODS, random_state=42, n_init=10)
    cluster_id = km.fit_predict(va)
    cluster_map = _cluster_to_mood(km.cluster_centers_)
    print(f"[clusters] {cluster_map}")
    anno["cluster"] = cluster_id; anno["mood"] = anno["cluster"].map(cluster_map)
    X, y, song_ids = [], [], []
    for _, row in tqdm(anno.iterrows(), total=len(anno), desc="extract"):
        sid = str(int(row["song_id"]))
        path = next((p for p in [DEAM_AUDIO/f"{sid}.mp3", DEAM_AUDIO/f"{int(sid)}.mp3", DEAM_AUDIO/f"{sid}.wav"] if p.exists()), None)
        if path is None: continue
        try: y_full, _ = librosa.load(str(path), sr=SAMPLE_RATE, mono=True)
        except: continue
        total = SEGMENTS_PER_TRACK * SAMPLES_PER_SEG
        if len(y_full) < total: y_full = np.pad(y_full, (0, total - len(y_full)))
        mood_idx = MOODS.index(row["mood"])
        for seg in range(SEGMENTS_PER_TRACK):
            start = seg * SAMPLES_PER_SEG
            X.append(_mel_segment(y_full[start:start+SAMPLES_PER_SEG])); y.append(mood_idx); song_ids.append(sid)
    X = np.stack(X)[..., np.newaxis]; y = np.array(y, dtype=np.int32); song_ids = np.array(song_ids)
    os.makedirs(os.path.dirname(MOOD_CACHE), exist_ok=True)
    np.savez_compressed(MOOD_CACHE, X=X, y=y, song_ids=song_ids, cluster_map=np.array(cluster_map, dtype=object))
    print(f"[done] {X.shape[0]} segments")
    return X, y, song_ids, cluster_map

if __name__ == "__main__": extract_all(force=True)
