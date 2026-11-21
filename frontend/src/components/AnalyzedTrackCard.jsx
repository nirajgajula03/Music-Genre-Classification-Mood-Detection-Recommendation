import { Play, Trash2, Music2, Plus } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import { resolveStreamUrl } from "../api/client";
import client from "../api/client";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function AnalyzedTrackCard({ upload, onDelete, queue = null, index = 0 }) {
  const p = usePlayer();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const song = {
    _id: upload._id,
    title: upload.filename.replace(/\.(mp3|wav)$/i, ""),
    artist: "Your upload",
    cover: `https://picsum.photos/seed/${upload._id}/300`,
    genre: upload.genre,
    mood: upload.mood,
    url: resolveStreamUrl(upload.url || `/api/uploads/${upload._id}/stream`)
  };

  const play = () => {
    if (queue && queue.length > 0) {
      const formattedQueue = queue.map(u => ({
        _id: u._id,
        title: u.filename.replace(/\.(mp3|wav)$/i, ""),
        artist: "Your upload",
        cover: `https://picsum.photos/seed/${u._id}/300`,
        genre: u.genre,
        mood: u.mood,
        url: resolveStreamUrl(u.url || `/api/uploads/${u._id}/stream`)
      }));
      p.playQueue(formattedQueue, index);
    } else {
      p.playQueue([song], 0);
    }
  };
  const remove = async () => {
    if (!confirm("Delete this upload?")) return;
    try { await client.delete(`/uploads/${upload._id}`); onDelete?.(upload._id); toast("Upload deleted", "info"); }
    catch { toast("Could not delete upload", "error"); }
  };
  const date = new Date(upload.created_at).toLocaleDateString();
  return (
    <div className="card group">
      <div className="relative">
        <img src={song.cover} alt="" className="w-full aspect-square object-cover rounded-xl"/>
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button onClick={play} className="p-3 rounded-full bg-gradient-to-br from-brand to-cyan opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition"><Play size={16}/></button>
          <button onClick={() => setShowModal(true)} className="p-3 rounded-full bg-white/10 backdrop-blur opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition"><Plus size={16}/></button>
        </div>
      </div>
      <div className="mt-3">
        <div className="font-medium truncate flex items-center gap-2"><Music2 size={14} className="text-cyan"/> {song.title}</div>
        <div className="text-xs text-slate-400 mt-0.5">Analyzed · {date}</div>
        <div className="mt-2 flex flex-wrap gap-1 text-xs">
          <span className="px-2 py-1 rounded bg-white/5 capitalize">{upload.genre}</span>
          <span className="px-2 py-1 rounded bg-white/5 capitalize">{upload.mood}</span>
          {upload.tempo && <span className="px-2 py-1 rounded bg-white/5">{Math.round(upload.tempo)} BPM</span>}
        </div>
        {upload.genre_confidence != null && (
          <div className="mt-2 h-1.5 rounded bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand to-cyan" style={{width: `${(upload.genre_confidence*100).toFixed(0)}%`}}/>
          </div>
        )}
      </div>
      <button onClick={remove} className="mt-3 w-full text-xs text-slate-400 hover:text-red-300 py-2 rounded-lg hover:bg-white/5 flex items-center justify-center gap-1"><Trash2 size={12}/> Delete</button>
      {showModal && <AddToPlaylistModal song={song} onClose={() => setShowModal(false)}/>}
    </div>
  );
}
