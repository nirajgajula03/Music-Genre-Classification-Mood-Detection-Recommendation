import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Play, Headphones, Disc3 } from "lucide-react";
import client from "../api/client";
import SongCard from "../components/SongCard";
import Visualizer from "../components/Visualizer";
import { usePlayer } from "../context/PlayerContext";

const GENRES = ["pop","rock","classical","jazz","hiphop","metal","country","disco","reggae","blues","bollywood"];

export default function Home() {
  const [songs, setSongs] = useState([]);
  const p = usePlayer();

  useEffect(() => {
    client.get("/songs")
      .then(r => setSongs(r.data.songs || []))
      .catch(() => setSongs([]));
  }, []);

  const featured = songs.slice(0, 5);
  const discovery = songs.slice(5, 15);

  const playAllFeatured = () => {
    if (featured.length > 0) {
      p.playQueue(featured, 0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="glass p-8 md:p-14 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-cyan border border-white/10 shadow-sm">
          <Sparkles size={14} className="text-cyan animate-pulse" />
          AI & Deep Neural Network Powered Audio Intelligence
        </span>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
          Deep Learning-Based Music Classification, <br />
          <span className="bg-gradient-to-r from-brand via-cyan to-pink-400 bg-clip-text text-transparent">
            Mood Detection & Recommendation System
          </span>
        </h1>

        <p className="mt-4 max-w-3xl text-slate-300 text-sm sm:text-base leading-relaxed">
          Upload any MP3 or WAV audio track. Our convolutional neural networks extract MFCCs and Mel spectrograms to predict genre with high confidence, detect 7 discrete emotional moods, and curate personalized recommendations.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/upload" className="btn-primary shadow-lg shadow-brand/20">
            <Headphones size={17} /> Analyze Track
          </Link>

          {featured.length > 0 && (
            <button
              onClick={playAllFeatured}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold inline-flex items-center gap-2 transition"
            >
              <Play size={16} className="text-cyan" /> Play Featured Mix
            </button>
          )}

          <Link
            to="/about"
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition"
          >
            Model Architecture & Docs
          </Link>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <Visualizer active={p.playing} />
        </div>
      </section>

      {/* Featured Songs */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Disc3 size={20} className="text-cyan" /> Featured Tracks
            </h2>
            <p className="text-xs text-slate-400">Selected tracks ready for instant streaming and playback</p>
          </div>
          {featured.length > 0 && (
            <button
              onClick={playAllFeatured}
              className="text-xs text-cyan hover:underline font-medium flex items-center gap-1"
            >
              Play all ({featured.length}) →
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {featured.map((s, i) => (
            <SongCard
              key={s._id || s.title}
              song={s}
              queue={featured}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Popular Genres */}
      <section className="mt-12">
        <div className="font-display text-2xl font-bold mb-1">Explore by Genre</div>
        <p className="text-xs text-slate-400 mb-4">Discover music categorized by CNN genre predictions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {GENRES.map(g => (
            <Link
              key={g}
              to={`/recommend?genre=${g}`}
              className="card capitalize text-center font-semibold hover:border-cyan/40 hover:scale-[1.02] transition py-3"
            >
              <span className="bg-gradient-to-r from-brand to-cyan bg-clip-text text-transparent">
                {g}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Discover More Tracks */}
      {discovery.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Discover More</h2>
              <p className="text-xs text-slate-400">More titles from the catalog</p>
            </div>
            <button
              onClick={() => p.playQueue(discovery, 0)}
              className="text-xs text-cyan hover:underline font-medium"
            >
              Play all ({discovery.length}) →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {discovery.map((s, i) => (
              <SongCard
                key={s._id || s.title + i}
                song={s}
                queue={discovery}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
