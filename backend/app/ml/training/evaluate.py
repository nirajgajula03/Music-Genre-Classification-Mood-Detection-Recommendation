import os, json, numpy as np, tensorflow as tf, matplotlib.pyplot as plt, seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from app.ml.training.config import *
from app.ml.training.dataset import load_splits, normalize

def main():
    if not os.path.exists(MODEL_PATH): raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    X_train, X_val, X_test, y_train, y_val, y_test = load_splits()
    X_train, X_val, X_test, _ = normalize(X_train, X_val, X_test)
    model = tf.keras.models.load_model(MODEL_PATH)
    probs = model.predict(X_test, verbose=1); y_pred = np.argmax(probs, axis=1)
    acc = accuracy_score(y_test, y_pred); prec = precision_score(y_test, y_pred, average="macro", zero_division=0)
    rec = recall_score(y_test, y_pred, average="macro", zero_division=0); f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)
    print(f"\nAccuracy: {acc:.4f} Precision: {prec:.4f} Recall: {rec:.4f} F1: {f1:.4f}\n")
    print(classification_report(y_test, y_pred, target_names=GENRES, zero_division=0))
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(9,7))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Purples", xticklabels=GENRES, yticklabels=GENRES)
    plt.xlabel("Predicted"); plt.ylabel("True"); plt.title(f"Confusion Matrix - Acc {acc:.3f}"); plt.tight_layout()
    os.makedirs(REPORTS_DIR, exist_ok=True)
    plt.savefig(os.path.join(REPORTS_DIR, "confusion_matrix.png"), dpi=120)
    with open(os.path.join(REPORTS_DIR, "metrics.json"), "w") as f:
        json.dump({"accuracy":float(acc),"precision":float(prec),"recall":float(rec),"f1":float(f1),"genres":GENRES}, f, indent=2)
    print(f"[saved] {REPORTS_DIR}/confusion_matrix.png + metrics.json")

if __name__ == "__main__": main()
