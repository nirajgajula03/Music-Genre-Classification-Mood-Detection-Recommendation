import os, tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from app.ml.training.mood_config import *
from app.config import settings

INPUT_SHAPE = (N_MELS, N_FRAMES, 1)
WARM_START = True

def build_model():
    inp = layers.Input(shape=INPUT_SHAPE)
    x = inp
    for filters in [32, 64, 128, 256]:
        x = layers.Conv2D(filters, 3, padding="same", activation="relu")(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2,2))(x)
        x = layers.Dropout(DROPOUT)(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(DROPOUT + 0.1)(x)
    out = layers.Dense(NUM_MOODS, activation="softmax")(x)
    model = models.Model(inp, out)
    if WARM_START and os.path.exists(settings.model_path):
        print(f"[warm-start] Loading conv base from {settings.model_path}")
        genre_model = tf.keras.models.load_model(settings.model_path)
        for i, layer in enumerate(model.layers):
            if i < len(genre_model.layers) and hasattr(genre_model.layers[i], "get_weights"):
                try: model.layers[i].set_weights(genre_model.layers[i].get_weights()); model.layers[i].trainable = True
                except: pass
    model.compile(optimizer=optimizers.Adam(LEARNING_RATE), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model

def get_callbacks():
    return [
        callbacks.EarlyStopping(monitor="val_loss", patience=EARLY_STOP_PATIENCE, restore_best_weights=True, verbose=1),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6, verbose=1),
        callbacks.ModelCheckpoint(MOOD_MODEL, monitor="val_accuracy", save_best_only=True, verbose=1),
    ]
