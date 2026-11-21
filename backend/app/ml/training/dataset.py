import json, numpy as np
from sklearn.model_selection import train_test_split
from app.ml.training.config import *
from app.ml.training.extract_features import extract_all

def load_splits():
    X, y = extract_all()
    X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE)
    val_frac = VAL_SIZE / (1 - TEST_SIZE)
    X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=val_frac, stratify=y_temp, random_state=RANDOM_STATE)
    print(f"[split] train={X_train.shape} val={X_val.shape} test={X_test.shape}")
    return X_train, X_val, X_test, y_train, y_val, y_test

def save_label_encoder():
    with open(LABEL_ENCODER, "w") as f: json.dump({"genres": GENRES}, f)

def normalize(X_train, *others):
    mean = X_train.mean(axis=(0,1,2), keepdims=True)
    std = X_train.std(axis=(0,1,2), keepdims=True) + 1e-6
    return (X_train - mean)/std, *[(x-mean)/std for x in others], (mean, std)
