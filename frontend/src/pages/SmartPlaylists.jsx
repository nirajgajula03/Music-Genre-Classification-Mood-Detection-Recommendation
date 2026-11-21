import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Sparkles, RefreshCw } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import SmartPlaylistCard from "../components/SmartPlaylistCard";

export default function SmartPlaylists() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]); const [busy, setBusy] = useState(true);
  const load = () => { setBusy(true); client.get("/smart-playlists").then(r => setItems(r.data.smart_playlists)).catch(() => {}).finally(() => setBusy(false)); };
  useEffect(load, []);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace/>;
  const totalSongs = items.reduce((a, b) => a + b.song_count, 0);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="glass p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand/30 rounded-full blur-3xl"/>
        <div className="flex items-center gap-2 text-cyan text-sm"><Sparkles size={16}/> Smart Playlists</div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">Auto-generated from your mood & genre</h1>
        <p className="mt-2 text-slate-300 max-w-2xl">These playlists update automatically as you upload and analyze new tracks. Save any of them to your library to keep a snapshot.</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-400"><span>{items.length} smart playlists</span><span>·</span><span>{totalSongs} songs matched</span><button onClick={load} className="ml-auto inline-flex items-center gap-1 text-cyan hover:underline"><RefreshCw size={12} className={busy ? "animate-spin" : ""}/> Refresh</button></div>
      </div>
      {busy ? <div className="text-slate-400">Loading…</div> : items.length === 0 ? <div className="glass p-12 text-center text-slate-400">No smart playlists available.</div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{items.map(sp => <SmartPlaylistCard key={sp.id} sp={sp}/>)}</div>}
    </div>
  );
}
