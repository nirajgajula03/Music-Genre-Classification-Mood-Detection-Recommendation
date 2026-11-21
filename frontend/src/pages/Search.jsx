
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Music2, X } from "lucide-react";
import client from "../api/client";
import SongCard from "../components/SongCard";

const GENRES = ["pop","rock","classical","jazz","hiphop","metal","country","disco","reggae","blues","bollywood"];

const MOODS = [
  {id:"happy",label:"Happy",icon:"😊"},
  {id:"sad",label:"Sad",icon:"😢"},
  {id:"energetic",label:"Energetic",icon:"⚡"},
  {id:"calm",label:"Calm",icon:"🌊"},
  {id:"angry",label:"Angry",icon:"🔥"},
  {id:"relaxing",label:"Relaxing",icon:"🍃"},
  {id:"romantic",label:"Romantic",icon:"💖"}
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const mood = searchParams.get("mood") || "";

  const [input, setInput] = useState(q);
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setInput(q), [q]);

  // Load complete public song library
  useEffect(() => {
    client.get("/songs")
      .then(r => setAllSongs(r.data.songs || []))
      .catch(() => setAllSongs([]));
  }, []);

  // Search results and filters
  useEffect(() => {
    setLoading(true);

    const query = {};
    if (q) query.q = q;
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;

    const t = setTimeout(() => {
      client.get("/songs", { params: query })
        .then(r => setSongs(r.data.songs || []))
        .catch(() => setSongs([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(t);
  }, [q, genre, mood]);

  // Live dropdown suggestions
  useEffect(() => {
    const value = input.trim().toLowerCase();

    if (!value) {
      setSuggestions([]);
      return;
    }

    const matches = allSongs.filter(song =>
      song.title?.toLowerCase().includes(value) ||
      song.artist?.toLowerCase().includes(value)
    );

    setSuggestions(matches.slice(0, 7));
  }, [input, allSongs]);

  const updateParams = (updates) => {
    const merged = { q: input, genre, mood, ...updates };
    const next = {};

    if (merged.q) next.q = merged.q;
    if (merged.genre) next.genre = merged.genre;
    if (merged.mood) next.mood = merged.mood;

    setSearchParams(next);
  };

  const submit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    updateParams({ q: input });
  };

  const selectSuggestion = (song) => {
    setInput(song.title);
    setShowSuggestions(false);
    setSearchParams({ q: song.title });
  };

  const toggleGenre = (g) =>
    updateParams({ genre: g === genre ? "" : g });

  const toggleMood = (m) =>
    updateParams({ mood: m === mood ? "" : m });

  const clearAll = () => {
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchParams({});
  };

  const hasFilters = q || genre || mood;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="glass p-6 mb-6">
        <h1 className="font-display text-2xl font-bold mb-4">
          Search music
        </h1>

        <form onSubmit={submit} className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={input}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search by song title or artist…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan focus:outline-none"
            />

            {showSuggestions && input.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-white/10 bg-slate-900 shadow-xl overflow-hidden">
                {suggestions.length > 0 ? (
                  suggestions.map(song => (
                    <button
                      key={song._id}
                      type="button"
                      onMouseDown={() => selectSuggestion(song)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 flex flex-col"
                    >
                      <span className="font-medium text-white">
                        {song.title}
                      </span>
                      <span className="text-sm text-slate-400">
                        {song.artist}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    No matching songs found
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Search
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm inline-flex items-center gap-1"
            >
              <X size={14}/> Clear
            </button>
          )}
        </form>
      </div>

      <div className="mb-4">
        <div className="text-sm text-slate-400 mb-2">Filter by mood</div>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => toggleMood(m.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition border capitalize ${
                mood === m.id
                  ? "bg-white/15 border-white/40"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <span className="mr-1">{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm text-slate-400 mb-2">Filter by genre</div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`px-3 py-1.5 rounded-full text-sm capitalize transition border ${
                genre === g
                  ? "bg-white/15 border-white/40"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm text-slate-400">
        {loading ? "Searching…" : `${songs.length} result${songs.length === 1 ? "" : "s"}`}
        {q && ` for "${q}"`}
        {genre && ` · ${genre}`}
        {mood && ` · ${mood} mood`}
      </div>

      {songs.length === 0 && !loading ? (
        <div className="glass p-12 text-center text-slate-400">
          <Music2 className="mx-auto mb-3 text-cyan" size={32}/>
          No songs found. Try different keywords or filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {songs.map((s, i) => (
            <SongCard
              key={s._id || s.title + s.artist + i}
              song={s}
              queue={songs}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
