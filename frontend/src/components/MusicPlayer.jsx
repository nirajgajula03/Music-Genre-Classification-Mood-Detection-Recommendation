import { usePlayer } from "../context/PlayerContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  X,
  Loader2,
  Sparkles,
  Music2
} from "lucide-react";
import { useState, useEffect } from "react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";
import Visualizer from "./Visualizer";

const fmt = (s) => {
  if (!s || !Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function MusicPlayer() {
  const p = usePlayer();
  const { toast } = useToast();

  const [fav, setFav] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubVal, setScrubVal] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    setFav(false);
  }, [p.current]);

  if (!p.current) return null;

  const favToggle = async () => {
    if (!localStorage.getItem("dm_token")) {
      toast("Login to save favourites", "warning");
      return;
    }
    try {
      await client.post("/playlist/favourites", {
        song_id: p.current._id || p.current.title,
        title: p.current.title,
        artist: p.current.artist,
        cover: p.current.cover,
        genre: p.current.genre,
      });
      setFav(true);
      toast("Added to favourites", "success");
    } catch {
      toast("Could not save favourite", "error");
    }
  };

  const displayProgress = isScrubbing ? scrubVal : p.progress;
  const progressPercent = p.duration > 0 ? Math.min(100, (displayProgress / p.duration) * 100) : 0;

  const handleScrubStart = (val) => {
    setIsScrubbing(true);
    setScrubVal(val);
  };

  const handleScrubChange = (val) => {
    setScrubVal(val);
  };

  const handleScrubCommit = (val) => {
    p.seek(val);
    setIsScrubbing(false);
  };

  return (
    <>
      {/* Floating Queue Drawer */}
      {p.showQueue && (
        <div className="fixed bottom-28 right-4 z-50 w-80 sm:w-96 max-h-[460px] glass p-4 shadow-2xl flex flex-col border border-white/20 rounded-2xl animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 font-display font-semibold text-sm">
              <ListMusic size={16} className="text-cyan" />
              <span>Playing Queue</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {p.queue.length}
              </span>
            </div>
            <button
              onClick={() => p.setShowQueue(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 py-2 scrollbar-thin">
            {p.queue.map((song, i) => {
              const isCurrent = i === p.index;
              return (
                <div
                  key={(song._id || song.title) + i}
                  onClick={() => p.playSongAt(i)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition text-left group ${
                    isCurrent
                      ? "bg-white/15 text-cyan font-medium border border-cyan/30"
                      : "hover:bg-white/5 text-slate-200"
                  }`}
                >
                  <span className="text-xs w-4 text-center text-slate-400">
                    {isCurrent ? "▶" : i + 1}
                  </span>
                  <img
                    src={song.cover || "/music-cover.svg"}
                    onError={(e) => { e.target.src = "/music-cover.svg"; }}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{song.title}</div>
                    <div className="truncate text-xs text-slate-400">
                      {song.artist || "Unknown artist"}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan/20 text-cyan uppercase font-semibold">
                      Now
                    </span>
                  )}
                  {p.queue.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        p.removeFromQueue(i);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Persistent Bottom Music Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass !rounded-none !border-x-0 !border-b-0 shadow-2xl backdrop-blur-2xl">
        <Visualizer active={p.playing} />

        {/* Global Error Banner */}
        {p.error && (
          <div className="bg-amber-500/20 text-amber-200 text-xs px-4 py-1 text-center border-t border-amber-500/30 flex items-center justify-center gap-2">
            <span>{p.error}</span>
          </div>
        )}

        {/* Interactive Scrub Bar on top edge of player for seamless mouse/touch seeking */}
        <div
          className="relative w-full h-2 bg-white/10 hover:h-3 transition-all cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            const target = clickPos * (p.duration || 0);
            p.seek(target);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-brand via-cyan to-brand transition-all"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs shrink-0">
            <div className="relative group shrink-0">
              <img
                src={p.current.cover || "/music-cover.svg"}
                onError={(e) => { e.target.src = "/music-cover.svg"; }}
                alt=""
                className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/10"
              />
              {p.isBuffering && (
                <div className="absolute inset-0 bg-black/50 rounded-xl grid place-items-center">
                  <Loader2 size={16} className="animate-spin text-cyan" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">
                {p.current.title}
              </div>
              <div className="truncate text-xs text-slate-400 flex items-center gap-1.5">
                <span>{p.current.artist || "Unknown artist"}</span>
                {p.current.genre && (
                  <>
                    <span>·</span>
                    <span className="capitalize text-[11px] text-cyan/90">
                      {p.current.genre}
                    </span>
                  </>
                )}
                {p.current.mood && (
                  <>
                    <span>·</span>
                    <span className="capitalize text-[11px] text-pink-300">
                      {p.current.mood}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={favToggle}
              className={`p-1.5 rounded-full shrink-0 transition ${
                fav ? "text-pink-400" : "text-slate-400 hover:text-white"
              }`}
              title="Add to Favourites"
            >
              <Heart size={16} fill={fav ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Central Playback & Scrub Controls */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Shuffle */}
              <button
                onClick={p.toggleShuffle}
                className={`p-1.5 rounded-full transition hidden sm:block ${
                  p.shuffle ? "text-cyan bg-cyan/20" : "text-slate-400 hover:text-white"
                }`}
                title={`Shuffle ${p.shuffle ? "On" : "Off"}`}
              >
                <Shuffle size={16} />
              </button>

              {/* Prev */}
              <button
                onClick={p.prev}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
                title="Previous Track"
              >
                <SkipBack size={18} />
              </button>

              {/* Seek Backward 10s */}
              <button
                onClick={() => p.seekRelative(-10)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition relative group"
                title="Rewind 10 seconds"
              >
                <RotateCcw size={16} />
                <span className="text-[9px] absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-70">
                  10s
                </span>
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={p.toggle}
                className="p-3 rounded-full bg-gradient-to-br from-brand to-cyan text-white shadow-lg shadow-brand/30 hover:scale-105 active:scale-95 transition"
                title={p.playing ? "Pause" : "Play"}
              >
                {p.isBuffering ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : p.playing ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} className="translate-x-0.5" />
                )}
              </button>

              {/* Seek Forward 10s */}
              <button
                onClick={() => p.seekRelative(10)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition relative group"
                title="Forward 10 seconds"
              >
                <RotateCw size={16} />
                <span className="text-[9px] absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-70">
                  10s
                </span>
              </button>

              {/* Next */}
              <button
                onClick={p.next}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
                title="Next Track"
              >
                <SkipForward size={18} />
              </button>

              {/* Repeat */}
              <button
                onClick={p.toggleRepeat}
                className={`p-1.5 rounded-full transition hidden sm:block ${
                  p.repeat !== "off" ? "text-cyan bg-cyan/20" : "text-slate-400 hover:text-white"
                }`}
                title={`Repeat: ${p.repeat}`}
              >
                {p.repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>

            {/* Time Slider Controls with Smooth Drag / Scrub Protection */}
            <div className="w-full flex items-center gap-2 mt-1 sm:mt-1.5 px-2">
              <span className="text-xs text-slate-400 w-11 text-right font-mono tabular-nums">
                {fmt(displayProgress)}
              </span>

              <input
                type="range"
                min={0}
                max={p.duration || 1}
                step={0.1}
                value={displayProgress}
                onMouseDown={(e) => handleScrubStart(+e.target.value)}
                onTouchStart={(e) => handleScrubStart(+e.target.value)}
                onChange={(e) => handleScrubChange(+e.target.value)}
                onMouseUp={(e) => handleScrubCommit(+e.target.value)}
                onTouchEnd={(e) => handleScrubCommit(+e.target.value)}
                className="flex-1 h-1.5 accent-cyan bg-white/20 rounded-lg cursor-pointer transition-all"
              />

              <span className="text-xs text-slate-400 w-11 font-mono tabular-nums">
                {fmt(p.duration)}
              </span>
            </div>
          </div>

          {/* Right Accessories: Speed, Volume, Queue Drawer */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Speed Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-xs px-2 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 font-mono"
                title="Playback Speed"
              >
                {p.playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 glass p-1 shadow-xl rounded-xl flex flex-col gap-1 z-50 min-w-[70px]">
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        p.setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`text-xs px-2 py-1 rounded text-center font-mono ${
                        p.playbackRate === rate ? "bg-cyan/30 text-cyan font-bold" : "hover:bg-white/10"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume & Mute */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={p.toggleMute}
                className="text-slate-400 hover:text-white transition"
                title={p.isMuted ? "Unmute" : "Mute"}
              >
                {p.isMuted || p.volume === 0 ? (
                  <VolumeX size={17} />
                ) : p.volume < 0.5 ? (
                  <Volume1 size={17} />
                ) : (
                  <Volume2 size={17} />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={p.isMuted ? 0 : p.volume}
                onChange={(e) => p.setVolume(+e.target.value)}
                className="w-20 accent-cyan h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>

            {/* Queue Toggle Button */}
            <button
              onClick={() => p.setShowQueue(!p.showQueue)}
              className={`p-2 rounded-xl transition border flex items-center gap-1.5 text-xs ${
                p.showQueue
                  ? "bg-cyan/20 border-cyan/40 text-cyan"
                  : "border-white/10 hover:bg-white/5 text-slate-300"
              }`}
              title="Toggle Up Next Queue"
            >
              <ListMusic size={16} />
              <span className="hidden xl:inline">Queue</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
