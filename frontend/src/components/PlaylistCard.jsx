import { Link } from "react-router-dom";
import { ListMusic, Play } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function PlaylistCard({ playlist }) {
  const p = usePlayer();
  const cover = playlist.cover || `https://picsum.photos/seed/${playlist._id}/300`;
  const playAll = (e) => { e.preventDefault(); if (playlist.songs?.length) p.playQueue(playlist.songs); };
  return (
    <Link to={`/playlists/${playlist._id}`} className="card group block">
      <div className="relative">
        <img src={cover} alt="" className="w-full aspect-square object-cover rounded-xl"/>
        <button onClick={playAll} className="absolute bottom-2 right-2 p-3 rounded-full bg-gradient-to-br from-brand to-cyan opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition"><Play size={16}/></button>
      </div>
      <div className="mt-3">
        <div className="font-medium truncate flex items-center gap-2"><ListMusic size={14} className="text-cyan"/> {playlist.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{playlist.song_count ?? playlist.songs?.length ?? 0} songs</div>
      </div>
    </Link>
  );
}
