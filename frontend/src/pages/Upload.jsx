
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, Music, CheckCircle2, Play, Sparkles
} from "lucide-react";
import UploadZone from "../components/UploadZone";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import { resolveStreamUrl } from "../api/client";
import client from "../api/client";

const MOOD_META = {
  happy: { icon: "😊", color: "#FFD166" },
  sad: { icon: "😢", color: "#4361EE" },
  energetic: { icon: "⚡", color: "#EF476F" },
  calm: { icon: "🌊", color: "#06D6A0" },
  romantic: { icon: "💖", color: "#F472B6" },
  angry: { icon: "🔥", color: "#DC2626" },
  relaxing: { icon: "🍃", color: "#22D3EE" }
};

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [smartMatches, setSmartMatches] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState("");

  const [publishNewSong, setPublishNewSong] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [cover, setCover] = useState("");

  const p = usePlayer();
  const { toast } = useToast();

  useEffect(() => {
    client.get("/songs", { params: { genre: "bollywood" } })
      .then(({ data }) => setSongs(data.songs || []))
      .catch(() => toast("Could not load Bollywood songs", "error"));
  }, []);

  const onFile = async (file) => {
    setErr("");
    setResult(null);
    setSmartMatches([]);

    if (publishNewSong && (!title.trim() || !artist.trim())) {
      setErr("Please enter both the song title and artist name.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      if (publishNewSong) {
        fd.append("title", title.trim());
        fd.append("artist", artist.trim());
        fd.append("album", album.trim());
        fd.append("language", language);
        fd.append("cover", cover.trim());
      } else if (selectedSongId) {
        fd.append("song_id", selectedSongId);
      }

      const { data } = await client.post("/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(data);

      if (data.linked_song) {
        toast(`Audio linked to ${data.linked_song}`, "success");
      }

      if (data.new_song) {
        toast(`${data.new_song.title} published to the public library!`, "success");

        client.get("/songs")
          .then(({ data: songsData }) => {
            setSongs(songsData.songs || []);
          })
          .catch(() => {});
      }

      if (data.saved && data.upload_id) {
        try {
          const r = await client.get(
            `/smart-playlists/matches/${data.upload_id}`
          );
          setSmartMatches(r.data.matches || []);
        } catch {}
      }
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
        "Analysis failed. Is the backend running?"
      );
      toast("Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
        Analyze your track
      </h1>

      <p className="text-slate-400 mb-6">
        Upload MP3/WAV — we'll classify genre and detect mood.
      </p>

      <div className="card mb-6">
        <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={publishNewSong}
            onChange={(e) => {
              setPublishNewSong(e.target.checked);
              setSelectedSongId("");
              setErr("");
            }}
          />
          Publish this as a new public song
        </label>

        {publishNewSong ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-slate-400">
              Enter song details. Genre and mood will be detected automatically.
            </p>

            <div>
              <label className="block text-sm mb-2">Song title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
                className="w-full rounded-lg p-3 bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Artist name *</label>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                className="w-full rounded-lg p-3 bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Album name</label>
              <input
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Enter album name (optional)"
                className="w-full rounded-lg p-3 bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg p-3 bg-slate-900 border border-white/10 text-white"
              >
                {["Hindi", "English", "Marathi", "Tamil", "Telugu", "Punjabi", "Other"].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Cover image URL</label>
              <input
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Paste an image URL (optional)"
                className="w-full rounded-lg p-3 bg-slate-900 border border-white/10 text-white"
              />
            </div>

            <p className="text-xs text-slate-400">
              Your song will be visible to everyone in the public library.
              Publish only audio you own or have permission to share.
            </p>
          </div>
          
        ) : (
          <div className="mt-5">
            <label className="block text-sm font-medium mb-2">
              Link audio to a Bollywood song (optional)
            </label>

            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
              className="w-full rounded-lg p-3 bg-slate-900 border border-white/10 text-white"
            >
              <option value="">Don't link to a Bollywood song</option>
              {songs.map((song) => (
                <option key={song._id} value={song._id}>
                  {song.title} — {song.artist}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-400 mt-2">
              Log in before uploading if you want to link audio to a catalog song.
            </p>
          </div>
        )}
      </div>

      <UploadZone onFile={onFile} />

      {loading && (
        <div className="glass mt-6 p-8 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-cyan" size={40} />
          <div>Extracting MFCC & Mel features…</div>
        </div>
      )}

      {err && (
        <div className="glass mt-6 p-4 border border-red-500/40 text-red-300">
          {err}
        </div>
      )}

      {result && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="card">
            <div className="text-xs text-slate-400">Predicted genre</div>
            <div className="text-3xl font-display capitalize mt-1">
              {result.genre}
            </div>

            <div className="mt-3 h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand to-cyan"
                style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
              />
            </div>

            <div className="mt-2 text-sm text-slate-300">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>

            {result.demo_mode && (
              <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                Demo mode — heuristic prediction. Train & mount your CNN to
                enable real inference.
              </div>
            )}
          </div>

          <div className="card flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl grid place-items-center text-3xl"
              style={{
                background: result.mood_color + "33",
                border: `1px solid ${result.mood_color}`
              }}
            >
              {MOOD_META[result.mood]?.icon}
            </div>

            <div>
              <div className="text-xs text-slate-400">Detected mood</div>
              <div className="text-2xl font-display capitalize">
                {result.mood}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tempo: {result.tempo} BPM
              </div>
            </div>
          </div>

          {result.saved && (
            <div className="md:col-span-2 glass p-4 border border-emerald-500/30 flex items-center gap-4 flex-wrap">
              <CheckCircle2 className="text-emerald-400" />

              <div className="flex-1">
                <div className="font-medium">
                  {result.new_song
                    ? "Published to the public music library"
                    : "Saved to your dashboard"}
                </div>
                <div className="text-xs text-slate-400">
                  {result.new_song
                    ? `${result.new_song.title} by ${result.new_song.artist} is now in the shared library.`
                    : result.linked_song
                      ? `Audio linked to ${result.linked_song}.`
                      : "Replay anytime from the Analyzed uploads section."}
                </div>
              </div>

              <button
                className="btn-primary !py-2"
                onClick={() =>
                  p.playQueue([{
                    _id: result.new_song?._id || result.upload_id,
                    title: result.new_song?.title ||
                      result.filename.replace(/\.(mp3|wav)$/i, ""),
                    artist: result.new_song?.artist || "Your upload",
                    cover: cover || `https://picsum.photos/seed/${result.upload_id}/300`,
                    genre: result.genre,
                    mood: result.mood,
                    url: resolveStreamUrl(result.replay_url)
                  }])
                }
              >
                <Play size={16} /> Play now
              </button>

              {result.new_song && (
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
                >
                  View public library
                </Link>
              )}

              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
              >
                Dashboard
              </Link>
            </div>
          )}

          {smartMatches.length > 0 && (
            <div className="md:col-span-2 glass p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Sparkles size={14} className="text-cyan" />
                This song now appears in {smartMatches.length} smart playlist
                {smartMatches.length === 1 ? "" : "s"}:
              </div>

              <div className="flex flex-wrap gap-2">
                {smartMatches.map((m) => (
                  <Link
                    key={m.id}
                    to={`/smart-playlists/${m.id}`}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm border border-white/10 transition"
                  >
                    {m.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <button
              className="btn-primary"
              onClick={() =>
                window.location.href =
                  `/recommend?genre=${result.genre}&mood=${result.mood}`
              }
            >
              <Music size={16} /> Get recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
