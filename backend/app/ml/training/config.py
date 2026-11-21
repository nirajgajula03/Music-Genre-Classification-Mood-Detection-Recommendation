from app.config import settings

SAMPLE_RATE = 22050
SEGMENT_SEC = 3
SAMPLES_PER_SEG = SAMPLE_RATE * SEGMENT_SEC
N_MELS = 128; N_FFT = 2048; HOP_LENGTH = 512; N_FRAMES = 130
GENRES = ["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"]
SEGMENTS_PER_TRACK = 10; NUM_CLASSES = 10
TEST_SIZE = 0.15; VAL_SIZE = 0.10; RANDOM_STATE = 42
BATCH_SIZE = 32; EPOCHS = 50; LEARNING_RATE = 1e-3; DROPOUT = 0.3; EARLY_STOP_PATIENCE = 8
GTZAN_ROOT = settings.gtzan_root
FEATURES_CACHE = settings.features_cache
MODEL_PATH = settings.model_path
LABEL_ENCODER = settings.label_encoder_path
REPORTS_DIR = settings.reports_dir
