import librosa
import numpy as np

GENRES = ["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"]

def extract_features(file_path, sr=22050, n_mfcc=40):
    y, sr = librosa.load(file_path, sr=sr, mono=True)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    mfcc_mean = mfcc.mean(axis=1)
    mel = librosa.feature.melspectrogram(y=y, sr=sr)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    return {
        "mfcc": mfcc_mean.tolist(), "mel_shape": list(mel_db.shape),
        "duration": float(librosa.get_duration(y=y, sr=sr)),
        "tempo": float(librosa.feature.tempo(y=y, sr=sr)[0]),
    }
