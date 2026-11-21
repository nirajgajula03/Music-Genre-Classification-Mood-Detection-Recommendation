import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { Play, Trash2, ArrowUp, ArrowDown, X, ListMusic, Pencil } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";

export default function PlaylistDetail() {
  const { id } = useParams(); const nav = useNavigate(); const { user, loading } = useAuth(); const p = usePlayer(); const { toast } = useToast();
  const [playlist, setPlaylist] = useState(null); const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState(false); const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  const load = () => { setBusy(true); client.get(`/playlists/${id}`).then(r => { setPlaylist(r.data.playlist); setName(r.data.playlist.name); setDesc(r.data.playlist.description || ""); }).catch(() => {}).finally(() => setBusy(false)); };
  useEffect(load, [id]);
  const saveEdit = async () => { try { await client.put(`/playlists/${id}`, { name, description: desc }); setEditing(false); load(); toast("Playlist updated", "success"); } catch { toast("Could not save changes", "error"); } };
  const remove = async () => { if (!confirm("Delete this playlist?")) return; try { await client.delete(`/playlists/${id}`); toast("Playlist deleted", "info"); nav("/playlists"); } catch { toast("Could not delete playlist", "error"); } };
  const removeSong = async (songId) => { await client.delete(`/playlists/${id}/songs/${songId}`); load(); };
  const move = async (idx, dir) => { if (!playlist) return; const songs = [...playlist.songs]; const target = idx + dir; if (target < 0 || target >= songs.length) return; [songs[idx], songs[target]] = [songs[target], songs[idx]]; setPlaylist({ ...playlist, songs }); await client.patch(`/playlists/${id}/reorder`, songs.map(s => s.song_id)); };
  const playAll = () => playlist?.songs?.length && p.playQueue(playlist.songs);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace/>;
  if (busy) return <div className="max-w-3xl mx-auto px-4 py-20 text-slate-400">Loading…</div>;
  if (!playlist) return <div className="max-w-3xl mx-auto px-4 py-20 text-red-300">Playlist not found</div>;
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="glass p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-end">
        <img src={playlist.cover} alt="" className="w-44 h-44 md:w-52 md:h-52 rounded-2xl object-cover shadow-2xl"/>
        <div className="flex-1 text-center md:text-left">
          <div className="text-xs uppercase tracking-wide text-cyan">Playlist</div>
          {editing ? <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full text-3xl md:text-4xl font-display font-bold bg-white/5 border border-white/10 rounded-xl px-3 py-2"/> : <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">{playlist.name}</h1>}
          {editing ? <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Description…" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"/> : <p className="mt-2 text-slate-400 text-sm">{playlist.description || "No description"}</p>}
          <div className="mt-2 text-xs text-slate-500">{playlist.songs.length} songs · updated {new Date(playlist.updated_at).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={playAll} disabled={!playlist.songs.length} className="btn-primary disabled:opacity-50"><Play size={16}/> Play all</button>
        {editing ? <button onClick={saveEdit} className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5">Save changes</button> : <button onClick={() => setEditing(true)} className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"><Pencil size={14} className="inline mr-1"/> Edit</button>}
        <button onClick={remove} className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 size={14} className="inline mr-1"/> Delete playlist</button>
        <Link to="/playlists" className="ml-auto px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm">Back to playlists</Link>
      </div>
      <div className="mt-6 glass overflow-hidden">
        {playlist.songs.length === 0 ? <div className="p-12 text-center text-slate-400"><ListMusic className="mx-auto mb-3 text-cyan" size={32}/>This playlist is empty. Add songs by clicking the + button on any song card.</div> :
         playlist.songs.map((s, i) => (
          <div key={s.song_id + i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5">
            <span className="w-6 text-right text-slate-500 text-sm">{i + 1}</span>
            <img src={s.cover} alt="" className="w-10 h-10 rounded-lg object-cover"/>
            <div className="flex-1 min-w-0"><div className="truncate text-sm font-medium">{s.title}</div><div className="truncate text-xs text-slate-400">{s.artist} · <span className="capitalize">{s.genre}</span></div></div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"><ArrowUp size={14}/></button>
              <button onClick={() => move(i, 1)} disabled={i === playlist.songs.length - 1} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"><ArrowDown size={14}/></button>
              <button onClick={() => p.playQueue(playlist.songs, i)} className="p-1.5 rounded hover:bg-white/10 text-cyan"><Play size={14}/></button>
              <button onClick={() => removeSong(s.song_id)} className="p-1.5 rounded hover:bg-white/10 text-red-300"><X size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
