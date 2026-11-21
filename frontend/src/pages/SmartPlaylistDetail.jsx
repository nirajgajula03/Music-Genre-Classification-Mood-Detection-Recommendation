import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { Play, Bookmark, ArrowLeft, Music2, Sparkles } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import SongCard from "../components/SongCard";

const MOOD_COLORS = { happy:"#FFD166", sad:"#4361EE", energetic:"#EF476F", calm:"#06D6A0", romantic:"#F472B6", angry:"#DC2626", relaxing:"#22D3EE" };
const GENRE_COLORS = { pop:"#EC4899", rock:"#F59E0B", jazz:"#8B5CF6", blues:"#3B82F6", classical:"#10B981", metal:"#EF4444", hiphop:"#F97316", country:"#EAB308", disco:"#06B6D4", reggae:"#22C55E" };

export default function SmartPlaylistDetail() {
  const { id } = useParams(); const { user, loading } = useAuth(); const p = usePlayer(); const nav = useNavigate(); const { toast } = useToast();
  const [data, setData] = useState(null); const [busy, setBusy] = useState(true); const [saving, setSaving] = useState(false);
  useEffect(() => { setData(null); setBusy(true); client.get(`/smart-playlists/${id}/songs`).then(r => setData(r.data)).catch(() => setData(null)).finally(() => setBusy(false)); }, [id]);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace/>;
  if (busy) return <div className="max-w-3xl mx-auto px-4 py-20 text-slate-400">Loading…</div>;
  if (!data) return <div className="max-w-3xl mx-auto px-4 py-20 text-red-300">Smart playlist not found</div>;
  const { template, songs } = data;
  const moodColor = template.mood ? MOOD_COLORS[template.mood] : "#7c3aed";
  const genreColor = template.genre ? GENRE_COLORS[template.genre] : "#22d3ee";
  const save = async () => { setSaving(true); try { const { data } = await client.post(`/smart-playlists/${id}/save`); nav(`/playlists/${data.playlist._id}`); } catch { toast("Could not save playlist", "error"); } finally { setSaving(false); } };
  const normalized = songs.map(s => ({ ...s, _id: s.song_id }));
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/smart-playlists" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6"><ArrowLeft size={14}/> All smart playlists</Link>
      <div className="glass p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-end">
        <div className="w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden grid place-items-center" style={{ background: `linear-gradient(135deg, ${moodColor}77, ${genreColor}77)` }}><Music2 size={56} className="text-white/80"/></div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-cyan"><Sparkles size={12}/> Smart Playlist</div>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">{template.title}</h1>
          <p className="mt-2 text-slate-400 text-sm">{template.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            {template.mood && <span className="px-3 py-1 rounded-full bg-white/5 capitalize text-sm" style={{ color: moodColor }}>Mood: {template.mood}</span>}
            {template.genre && <span className="px-3 py-1 rounded-full bg-white/5 capitalize text-sm" style={{ color: genreColor }}>Genre: {template.genre}</span>}
            <span className="px-3 py-1 rounded-full bg-white/5 text-sm">{songs.length} songs</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Updates automatically when you upload new songs matching this criteria.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => songs.length && p.playQueue(normalized)} disabled={!songs.length} className="btn-primary disabled:opacity-40"><Play size={16}/> Play all</button>
        <button onClick={save} disabled={saving || !songs.length} className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-40"><Bookmark size={14} className="inline mr-1"/> {saving ? "Saving…" : "Save to My Playlists"}</button>
      </div>
      <div className="mt-8">{songs.length === 0 ? <div className="glass p-12 text-center text-slate-400"><Music2 className="mx-auto mb-3 text-cyan" size={32}/>No songs match this combination yet. Upload and analyze more tracks to populate this smart playlist.</div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{normalized.map(s => <SongCard key={s.song_id} song={s}/>)}</div>}</div>
    </div>
  );
}
