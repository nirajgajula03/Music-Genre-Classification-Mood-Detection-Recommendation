import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import SongCard from "../components/SongCard";
import AnalyzedTrackCard from "../components/AnalyzedTrackCard";
import PlaylistCard from "../components/PlaylistCard";
import SmartPlaylistCard from "../components/SmartPlaylistCard";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [favs, setFavs] = useState([]); const [hist, setHist] = useState([]); const [songs, setSongs] = useState([]);
  const [uploads, setUploads] = useState([]); const [playlists, setPlaylists] = useState([]); const [smart, setSmart] = useState([]);
  useEffect(() => {
    if (!user) return;
    client.get("/playlist/favourites").then(r => setFavs(r.data.favourites)).catch(()=>{});
    client.get("/playlist/history").then(r => setHist(r.data.history)).catch(()=>{});
    client.get("/songs").then(r => setSongs(r.data.songs)).catch(()=>{});
    client.get("/uploads").then(r => setUploads(r.data.uploads)).catch(()=>{});
    client.get("/playlists").then(r => setPlaylists(r.data.playlists)).catch(()=>{});
    client.get("/smart-playlists").then(r => setSmart(r.data.smart_playlists.slice(0, 4))).catch(()=>{});
  }, [user]);
  const removeUpload = (id) => setUploads(prev => prev.filter(u => u._id !== id));
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace/>;
  const recs = songs.slice(0, 5);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="glass p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-cyan grid place-items-center text-2xl font-bold">{user.name?.[0]?.toUpperCase()}</div>
        <div><div className="text-xl font-display font-bold">{user.name}</div><div className="text-sm text-slate-400">{user.email}</div></div>
      </div>
      <Section title="Analyzed uploads">{uploads.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{uploads.map((u, i) => <AnalyzedTrackCard key={u._id} upload={u} queue={uploads} index={i} onDelete={removeUpload}/>)}</div> : <Empty/>}</Section>
      <Section title="Your playlists">{playlists.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{playlists.map(p => <PlaylistCard key={p._id} playlist={p}/>)}</div> : <Empty/>}</Section>
      <Section title="Smart playlists">{smart.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{smart.map(sp => <SmartPlaylistCard key={sp.id} sp={sp}/>)}</div> : <Empty/>}</Section>
      <Section title="Favourites">{favs.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{favs.map((s, i) => <SongCard key={s.song_id || s.title + i} song={{...s, cover:s.cover}} queue={favs} index={i}/>)}</div> : <Empty/>}</Section>
      <Section title="Recently played">{hist.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{hist.map((s, i) => <SongCard key={s._id || s.title + s.played_at + i} song={s} queue={hist} index={i}/>)}</div> : <Empty/>}</Section>
      <Section title="Recommended for you"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{recs.map((s, i) => <SongCard key={s._id || s.title + i} song={s} queue={recs} index={i}/>)}</div></Section>
    </div>
  );
}
function Section({ title, children }) { return <section className="mt-10"><h2 className="font-display text-2xl font-bold mb-4">{title}</h2>{children}</section>; }
function Empty() { return <div className="text-slate-400 text-sm">Nothing here yet. <Link to="/smart-playlists" className="text-cyan">Explore →</Link></div>; }
