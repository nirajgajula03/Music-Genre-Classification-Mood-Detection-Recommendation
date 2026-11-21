from pathlib import Path
from app.config import settings

SAMPLE_RATE = 22050; SEGMENT_SEC = 3; SAMPLES_PER_SEG = SAMPLE_RATE * SEGMENT_SEC
N_MELS = 128; N_FFT = 2048; HOP_LENGTH = 512; N_FRAMES = 130; SEGMENTS_PER_TRACK = 10
MOODS = ["happy","sad","calm","energetic","angry","relaxing"]; NUM_MOODS = 6
MOOD_COLORS = {"happy":"#FFD166","sad":"#4361EE","energetic":"#EF476F","calm":"#06D6A0","angry":"#DC2626","relaxing":"#22D3EE"}
TEST_SIZE = 0.15; VAL_SIZE = 0.10; RANDOM_STATE = 42
BATCH_SIZE = 32; EPOCHS = 50; LEARNING_RATE = 1e-3; DROPOUT = 0.3; EARLY_STOP_PATIENCE = 8
DEAM_ROOT = settings.deam_root
DEAM_AUDIO = Path(DEAM_ROOT) / "MP3" if DEAM_ROOT else Path("")
DEAM_ANNO = Path(DEAM_ROOT) / "annotations" if DEAM_ROOT else Path("")
MOOD_CACHE = settings.mood_features_cache
MOOD_MODEL = settings.mood_model_path
MOOD_ENCODER = settings.mood_label_encoder_path
REPORTS_DIR = settings.reports_dir
