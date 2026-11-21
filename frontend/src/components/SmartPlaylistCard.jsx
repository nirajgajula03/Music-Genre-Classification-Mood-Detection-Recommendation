import { Link, useNavigate } from "react-router-dom";
import { Play, Bookmark, Music2 } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import client from "../api/client";

const MOOD_COLORS = { happy:"#FFD166", sad:"#4361EE", energetic:"#EF476F", calm:"#06D6A0", romantic:"#F472B6", angry:"#DC2626", relaxing:"#22D3EE" };
const GENRE_COLORS = { pop:"#EC4899", rock:"#F59E0B", jazz:"#8B5CF6", blues:"#3B82F6", classical:"#10B981", metal:"#EF4444", hiphop:"#F97316", country:"#EAB308", disco:"#06B6D4", reggae:"#22C55E" };

export default function SmartPlaylistCard({ sp }) {
  const p = usePlayer(); const nav = useNavigate(); const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const moodColor = sp.mood ? MOOD_COLORS[sp.mood] : "#7c3aed";
  const genreColor = sp.genre ? GENRE_COLORS[sp.genre] : "#22d3ee";
  const gradient = `linear-gradient(135deg, ${moodColor}77 0%, ${genreColor}77 100%)`;
  const playAll = async (e) => { e.preventDefault(); if (sp.song_count === 0) return; try { const { data } = await client.get(`/smart-playlists/${sp.id}/songs`); if (data.songs.length) p.playQueue(data.songs); } catch {} };
  const save = async (e) => { e.preventDefault(); if (!localStorage.getItem("dm_token")) { nav("/login"); return; } if (sp.song_count === 0) return; setBusy(true); try { const { data } = await client.post(`/smart-playlists/${sp.id}/save`); nav(`/playlists/${data.playlist._id}`); } catch { toast("Could not save playlist", "error"); } finally { setBusy(false); } };
  return (
    <div className="card group">
      <Link to={`/smart-playlists/${sp.id}`} className="block">
        <div className="relative aspect-square rounded-xl overflow-hidden grid place-items-center" style={{ background: gradient }}>
          <Music2 size={48} className="text-white/80 relative z-10"/>
          <div className="absolute inset-0 bg-black/20"/>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
            {sp.mood && <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] capitalize" style={{ color: moodColor }}>{sp.mood}</span>}
            {sp.genre && <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] capitalize" style={{ color: genreColor }}>{sp.genre}</span>}
          </div>
        </div>
      </Link>
      <div className="mt-3">
        <div className="font-medium truncate">{sp.title}</div>
        <div className="text-xs text-slate-400 truncate mt-0.5">{sp.description}</div>
        <div className="text-xs text-slate-500 mt-1">{sp.song_count} song{sp.song_count === 1 ? "" : "s"}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={playAll} disabled={sp.song_count === 0} className="flex-1 btn-primary !py-2 !text-xs justify-center disabled:opacity-40"><Play size={12}/> Play all</button>
        <button onClick={save} disabled={busy || sp.song_count === 0} className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-40" title="Save to My Playlists"><Bookmark size={14}/></button>
      </div>
    </div>
  );
}
