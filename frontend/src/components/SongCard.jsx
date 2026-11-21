import { Play, Pause, Plus, Heart, Music2 } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import client from "../api/client";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function SongCard({ song, queue = null, index = 0 }) {
  const p = usePlayer();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [fav, setFav] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    song.cover || "/music-cover.svg"
  );

  const isCurrent = p.current && (
    (song._id && p.current._id === song._id) ||
    (p.current.title === song.title && p.current.artist === song.artist)
  );

  const handlePlayClick = () => {
    if (isCurrent) {
      p.toggle();
      return;
    }
    if (queue && queue.length > 0) {
      p.playQueue(queue, index);
    } else {
      p.playQueue([song], 0);
    }
  };

  const favToggle = async (e) => {
    e.stopPropagation();
    if (!localStorage.getItem("dm_token")) {
      toast("Login to save favourites", "warning");
      return;
    }

    try {
      await client.post("/playlist/favourites", {
        song_id: song._id || song.title,
        title: song.title,
        artist: song.artist || "",
        cover: song.cover || "",
        genre: song.genre || "",
      });
      setFav(true);
      toast("Added to favourites", "success");
    } catch {
      toast("Could not save favourite", "error");
    }
  };

  return (
    <div className={`card group relative flex flex-col justify-between transition-all duration-200 ${
      isCurrent ? "!border-cyan/50 shadow-lg shadow-cyan/10" : ""
    }`}>
      <div className="relative">
        <img
          src={imageSrc}
          onError={() => setImageSrc("/music-cover.svg")}
          alt={song.title || "Music cover"}
          className="w-full aspect-square object-cover rounded-xl"
        />

        {/* Play & Add Overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handlePlayClick}
            className="p-3 rounded-full bg-gradient-to-br from-brand to-cyan text-white shadow-xl hover:scale-110 active:scale-95 transition"
            title={isCurrent && p.playing ? "Pause" : "Play"}
          >
            {isCurrent && p.playing ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="p-3 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white hover:scale-110 active:scale-95 transition"
            title="Add to Playlist"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Currently playing badge */}
        {isCurrent && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan text-slate-900 shadow">
            {p.playing ? "PLAYING" : "PAUSED"}
          </span>
        )}
      </div>

      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className={`font-semibold text-sm truncate ${isCurrent ? "text-cyan" : "text-white"}`}>
            {song.title}
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5">
            {song.artist || "Unknown artist"}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {song.genre && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 capitalize text-[11px]">
                {song.genre}
              </span>
            )}
            {song.mood && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-pink-300 capitalize text-[10px]">
                {song.mood}
              </span>
            )}
          </div>

          <button
            onClick={favToggle}
            className={`p-1.5 rounded-full hover:bg-white/10 transition ${
              fav ? "text-pink-400" : "text-slate-400 hover:text-white"
            }`}
            title="Add to Favourites"
          >
            <Heart size={14} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {showModal && (
        <AddToPlaylistModal
          song={song}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
