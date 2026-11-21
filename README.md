# Deep Music — AI Music Classification, Mood Detection & Recommendation

Full-stack platform using TensorFlow/Keras CNNs to classify music genre and mood.

## Quick Start
1. Start MongoDB: `docker compose up -d mongo`
2. Backend: `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cp .env.example .env && uvicorn main:app --reload --port 8000`
3. Frontend: `cd frontend && npm install && cp .env.example .env && npm run dev`
4. Open http://localhost:5173

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, React Router
- Backend: FastAPI, Motor (MongoDB), JWT auth
- ML: TensorFlow/Keras, Librosa, scikit-learn
- Database: MongoDB + GridFS

## Training Models
- Genre CNN: GTZAN dataset, Mel spectrogram input, 10 genres
- Mood CNN: DEAM dataset, valence-arousal → 6 moods via KMeans
- See backend/app/ml/training/ for training scripts
- Set DEMO_MODE=true if models not yet trained

## API Docs
http://localhost:8000/docs
