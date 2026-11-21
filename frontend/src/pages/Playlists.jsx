import { useEffect, useState } from "react";
import { Plus, ListMusic, Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PlaylistCard from "../components/PlaylistCard";

export default function Playlists() {
  const { user, loading } = useAuth(); const { toast } = useToast();
  const [items, setItems] = useState([]); const [busy, setBusy] = useState(true);
  const [name, setName] = useState(""); const [creating, setCreating] = useState(false);
  useEffect(() => { if (!user) return; client.get("/playlists").then(r => setItems(r.data.playlists)).catch(() => toast("Could not load playlists", "error")).finally(() => setBusy(false)); }, [user]);
  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try { const { data } = await client.post("/playlists", { name: name.trim() }); setItems(prev => [{ ...data.playlist, songs: [] }, ...prev]); setName(""); toast("Playlist created", "success"); }
    catch { toast("Could not create playlist", "error"); }
    finally { setCreating(false); }
  };
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace/>;
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">Your playlists</h1>
      <div className="glass p-4 mb-8 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Name your new playlist…" className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"/>
        <button onClick={create} disabled={creating || !name.trim()} className="btn-primary disabled:opacity-50"><Plus size={16}/> {creating ? "Creating…" : "Create"}</button>
      </div>
      {busy ? <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin"/> Loading playlists…</div> :
       items.length === 0 ? <div className="glass p-12 text-center text-slate-400"><ListMusic className="mx-auto mb-3 text-cyan" size={40}/>You don't have any playlists yet. Create one above to start collecting songs.</div> :
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{items.map(p => <PlaylistCard key={p._id} playlist={p}/>)}</div>}
    </div>
  );
}
