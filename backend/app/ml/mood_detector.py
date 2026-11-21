import os, random
from app.config import settings
from app.ml.features import extract_features

MOOD_COLORS = {"happy":"#FFD166","sad":"#4361EE","energetic":"#EF476F","calm":"#06D6A0",
               "romantic":"#F472B6","angry":"#DC2626","relaxing":"#22D3EE"}

class MoodDetector:
    def __init__(self):
        self.demo = settings.demo_mode_mood
        self.predictor = None
        if not self.demo:
            try:
                if not os.path.exists(settings.mood_model_path):
                    print(f"[warn] Mood model not found at {settings.mood_model_path}; falling back to heuristic.")
                    self.demo = True
                else:
                    from app.ml.training.predict_mood import MoodPredictor
                    self.predictor = MoodPredictor()
            except Exception as e:
                print(f"[warn] Mood model load failed ({e}); using heuristic.")
                self.demo = True

    def detect(self, file_path):
        feats = extract_features(file_path)
        tempo = feats["tempo"]
        if self.demo or self.predictor is None:
            energy = float(sum(abs(v) for v in feats["mfcc"][:10])) / 10
            if tempo > 150 and energy > 250: mood = "angry"
            elif tempo > 130 and energy > 150: mood = "energetic"
            elif tempo < 70: mood = "sad"
            elif tempo < 95: mood = "relaxing"
            elif 95 <= tempo <= 120 and energy < 120: mood = "calm"
            elif 100 <= tempo <= 130: mood = "happy"
            else: mood = "calm"
            return {"demo_mode": True, "mood": mood, "color": MOOD_COLORS.get(mood, "#999"),
                    "confidence": None, "tempo": round(tempo, 1), "probabilities": None}
        result = self.predictor.predict(file_path)
        return {"demo_mode": False, "mood": result["mood"], "color": MOOD_COLORS.get(result["mood"], "#999"),
                "confidence": result["confidence"], "tempo": round(tempo, 1), "probabilities": result["probabilities"]}

mood_detector = MoodDetector()
