import os, random
from app.config import settings
from app.ml.features import GENRES, extract_features

class GenreClassifier:
    def __init__(self):
        self.demo = settings.demo_mode
        self.predictor = None
        if not self.demo:
            try:
                if not os.path.exists(settings.model_path):
                    print(f"[warn] Trained model not found at {settings.model_path}; falling back to demo.")
                    self.demo = True
                else:
                    from app.ml.training.predict import GenrePredictor
                    self.predictor = GenrePredictor()
            except Exception as e:
                print(f"[warn] Model load failed ({e}); using demo mode.")
                self.demo = True

    def predict(self, file_path):
        feats = extract_features(file_path)
        if self.demo or self.predictor is None:
            tempo = feats["tempo"]
            if tempo < 80: guesses = ["classical","jazz","blues"]
            elif tempo < 110: guesses = ["blues","reggae","pop"]
            elif tempo < 130: guesses = ["pop","country","disco"]
            elif tempo < 150: guesses = ["rock","hiphop","disco"]
            else: guesses = ["metal","rock","hiphop"]
            top = random.choice(guesses)
            probs = {g: round(random.uniform(0.02, 0.18), 3) for g in GENRES}
            probs[top] = round(random.uniform(0.55, 0.82), 3)
            return {"demo_mode": True, "genre": top, "confidence": probs[top], "probabilities": probs, "features": feats}
        result = self.predictor.predict(file_path)
        return {"demo_mode": False, "genre": result["genre"], "confidence": result["confidence"],
                "probabilities": result["probabilities"], "top_k": result.get("top_k"), "features": feats}

classifier = GenreClassifier()
