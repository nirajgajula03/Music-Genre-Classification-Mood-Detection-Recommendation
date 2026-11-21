# 🎵 Deep Music
### AI-Powered Music Genre Classification, Mood Detection & Recommendation System

Deep Music is a full-stack music platform that uses Deep Learning and Artificial Intelligence to classify music genres, detect emotional moods, and recommend songs based on users' listening preferences.

## 🚀 Features

- 🎧 **Music Genre Classification** – Classifies songs into different music genres using CNN models.
- 😊 **Mood Detection** – Detects the emotional mood of music.
- 🎵 **Music Recommendation** – Recommends songs based on genre and mood.
- 📂 **Music Upload** – Allows users to upload and analyze music.
- 👤 **User Authentication** – Secure registration and login.
- 📋 **Smart Playlists** – Organizes songs into personalized playlists.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Deep Learning | TensorFlow, Keras |
| Audio Processing | Librosa |
| Machine Learning | Scikit-learn |
| Database | MongoDB |
| Storage | GridFS, Amazon S3 |

## 🧠 Machine Learning Models

**Genre Classification**
- CNN-based classification model.
- Uses Mel Spectrogram features.
- Trained using the GTZAN dataset.
- Supports 10 music genres.

**Mood Detection**
- CNN-based mood classification.
- Uses the DEAM dataset.
- Maps valence and arousal into 6 mood categories using KMeans.

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nirajgajula03/Music-Genre-Classification-Mood-Detection-Recommendation.git
cd Music-Genre-Classification-Mood-Detection-Recommendation
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the environment:

Windows:
```bash
.venv\Scripts\activate
```

Linux/Mac:
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env`, configure your environment variables, and start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`, configure the required variables, and run:

```bash
npm run dev
```

### 4. Access the Application

Frontend: http://localhost:5173

Backend API: http://localhost:8000

API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```text
Deep-Music/
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── training/
│   │   │   ├── genre_classifier.py
│   │   │   ├── mood_detector.py
│   │   │   └── recommender.py
│   │   ├── routers/
│   │   └── storage/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🔮 Future Improvements

- Improve music classification accuracy.
- Support additional music genres and mood categories.
- Enhance personalized recommendation algorithms.
- Integrate additional music streaming features.

## 👨‍💻 Developer

**Niraj Gajula**

BTech – Information Technology

GitHub: [nirajgajula03](https://github.com/nirajgajula03)

---

⭐ If you find this project interesting, consider giving it a star!
