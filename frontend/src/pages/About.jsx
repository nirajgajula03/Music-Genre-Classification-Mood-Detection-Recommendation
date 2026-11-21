import { Brain, Waves, ListMusic, Database, Cpu, FlaskConical } from "lucide-react";

const cards = [
  { icon: Brain, title:"Problem", text:"Listeners struggle to discover music matching both genre preference and emotional context." },
  { icon: Cpu, title:"Objectives", text:"Classify genre, detect mood, and recommend contextually relevant tracks." },
  { icon: Waves, title:"Feature Pipeline", text:"Librosa extracts MFCC & Mel spectrograms from each uploaded track." },
  { icon: Brain, title:"CNN Classifier", text:"A convolutional neural network maps spectrograms to 10 genres." },
  { icon: FlaskConical, title:"Mood Detection", text:"DEAM valence/arousal → KMeans clustering → 6 discrete moods." },
  { icon: ListMusic, title:"Recommendation", text:"Content-based similarity over genre + mood compatibility graph." },
];
const stack = [["Frontend","React.js, Vite, Tailwind CSS, HTML, JavaScript"],["Backend","FastAPI, Python, Rest APIs"],["ML","TensorFlow/Keras, Librosa, NumPy, Pandas, scikit-learn"],["Database","MongoDB"]];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold">Deep Learning-Based Music Classification, Mood Detection, and Recommendation System</h1>
      <p className="mt-3 text-slate-300 max-w-3xl">An advanced deep-learning-powered platform that analyzes audio tracks using Convolutional Neural Networks (CNNs), classifies genre, detects emotional valence-arousal moods, and serves intelligent content-based recommendations — wrapped in a high-performance modern music player.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">{cards.map(c => <div key={c.title} className="card"><c.icon className="text-cyan mb-2"/><div className="font-display font-bold">{c.title}</div><div className="text-sm text-slate-400 mt-1">{c.text}</div></div>)}</div>
      <h2 className="font-display text-2xl font-bold mt-10 mb-4">Technology stack</h2>
      <div className="glass overflow-hidden">{stack.map(([k,v], i) => <div key={k} className={`flex justify-between px-4 py-3 ${i%2 ? "bg-white/5":""}`}><span className="font-medium">{k}</span><span className="text-slate-300 text-right">{v}</span></div>)}</div>
    </div>
  );
}
