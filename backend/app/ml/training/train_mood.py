import os, json, numpy as np, tensorflow as tf, matplotlib.pyplot as plt
from app.ml.training.mood_config import *
from app.ml.training.mood_dataset import load_splits, save_label_encoder, normalize
from app.ml.training.mood_model import build_model, get_callbacks

def main():
    print("=== Loading mood dataset ===")
    X_train, X_val, X_test, y_train, y_val, y_test = load_splits()
    save_label_encoder()
    print("=== Normalizing ===")
    X_train, X_val, X_test, (mean, std) = normalize(X_train, X_val, X_test)
    with open(os.path.join(os.path.dirname(MOOD_MODEL), "mood_norm_stats.json"), "w") as f:
        json.dump({"mean": float(mean.ravel()[0]), "std": float(std.ravel()[0])}, f)
    print("=== Building model ===")
    model = build_model(); model.summary()
    print("=== Training ===")
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val),
        epochs=EPOCHS, batch_size=BATCH_SIZE, callbacks=get_callbacks(), verbose=2)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    plt.figure(figsize=(10,4))
    plt.subplot(1,2,1); plt.plot(history.history["accuracy"], label="train"); plt.plot(history.history["val_accuracy"], label="val"); plt.title("Mood Accuracy"); plt.legend()
    plt.subplot(1,2,2); plt.plot(history.history["loss"], label="train"); plt.plot(history.history["val_loss"], label="val"); plt.title("Mood Loss"); plt.legend()
    plt.tight_layout(); plt.savefig(os.path.join(REPORTS_DIR, "mood_training_curve.png"), dpi=120)
    print(f"[done] Mood model saved at {MOOD_MODEL}")

if __name__ == "__main__": main()
