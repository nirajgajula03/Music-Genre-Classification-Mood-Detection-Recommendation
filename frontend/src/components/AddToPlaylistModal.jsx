import { useEffect, useState } from "react";
import { X, Plus, Check, ListMusic } from "lucide-react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";

export default function AddToPlaylistModal({ song, onClose }) {
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    client.get("/playlists").then(r => setPlaylists(r.data.playlists)).catch(() => toast("Could not load playlists", "error")).finally(() => setLoading(false));
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const add = async (pid) => {
    setAddingTo(pid);
    try {
      await client.post(`/playlists/${pid}/songs`, { song_id: song._id || song.title, title: song.title, artist: song.artist || "Unknown", cover: song.cover || "", genre: song.genre || "", mood: song.mood || "", url: song.url });
      setPlaylists(prev => prev.map(p => p._id === pid ? { ...p, song_count: (p.song_count || 0) + 1 } : p));
      toast("Added to playlist", "success");
    } catch { toast("Failed to add song", "error"); }
    finally { setAddingTo(null); }
  };
  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await client.post("/playlists", { name: newName.trim() });
      setPlaylists(prev => [{ ...data.playlist, songs: [] }, ...prev]);
      setNewName("");
      await add(data.playlist._id);
    } catch { toast("Could not create playlist", "error"); }
    finally { setCreating(false); }
  };
  if (!song) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="glass p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">Add to playlist</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={18}/></button>
        </div>
        <div className="text-sm text-slate-400 mb-4 truncate">Song: <span className="text-white">{song.title}</span></div>
        <div className="flex gap-2 mb-4">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New playlist name…" onKeyDown={(e) => e.key === "Enter" && create()} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"/>
          <button onClick={create} disabled={creating || !newName.trim()} className="btn-primary !py-2 disabled:opacity-50"><Plus size={16}/> Create</button>
        </div>
        <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-white/5">
          {loading ? <div className="text-slate-400 text-sm py-4">Loading…</div> :
           playlists.length === 0 ? <div className="text-slate-400 text-sm py-4">No playlists yet — create one above.</div> :
           playlists.map(p => (
            <button key={p._id} onClick={() => add(p._id)} disabled={addingTo === p._id} className="w-full flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-white/5 disabled:opacity-50 text-left">
              <ListMusic size={16} className="text-cyan"/>
              <div className="flex-1 min-w-0"><div className="text-sm truncate">{p.name}</div><div className="text-xs text-slate-500">{p.song_count ?? 0} songs</div></div>
              {addingTo === p._id ? <Check size={16} className="text-emerald-400"/> : <Plus size={16} className="text-slate-400"/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
