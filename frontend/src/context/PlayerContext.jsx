import { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import { resolveStreamUrl } from "../api/client";
import client from "../api/client";

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const prevTrackKeyRef = useRef(null);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState("off"); // 'off' | 'all' | 'one'
  const [shuffle, setShuffle] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [showQueue, setShowQueue] = useState(false);
  const [playSession, setPlaySession] = useState(0);

  const current = queue[index] || null;

  // Preload catalog so playing single cards or reaching end of queue can autoplay
  useEffect(() => {
    client.get("/songs")
      .then(r => setCatalog(r.data.songs || []))
      .catch(() => {});
  }, []);

  // Main method to play a list of songs or a single song with queue
  const playQueue = useCallback((list, startIndex = 0) => {
    if (!list || !list.length) return;

    let targetQueue = [...list];

    // If only 1 song is provided, enrich queue with catalog tracks
    if (targetQueue.length === 1 && catalog.length > 0) {
      const currentId = targetQueue[0]._id || targetQueue[0].title;
      const additional = catalog.filter(s => (s._id || s.title) !== currentId);
      targetQueue = [targetQueue[0], ...additional];
    }

    const safeIndex = Math.max(0, Math.min(startIndex, targetQueue.length - 1));
    setQueue(targetQueue);
    setIndex(safeIndex);
    setProgress(0);
    setDuration(0);
    setError("");
    setPlaying(true);
    setPlaySession(s => s + 1);
  }, [catalog]);

  const toggle = useCallback(() => {
    if (!current) {
      if (queue.length > 0) {
        setPlaying(true);
      } else if (catalog.length > 0) {
        playQueue(catalog, 0);
      }
      return;
    }
    setPlaying(p => !p);
  }, [current, queue.length, catalog, playQueue]);

  const next = useCallback(() => {
    if (!queue.length) return;

    if (repeat === "one") {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
        setProgress(0);
        setPlaying(true);
      }
      return;
    }

    if (shuffle && queue.length > 1) {
      let randIdx = Math.floor(Math.random() * queue.length);
      if (randIdx === index) randIdx = (randIdx + 1) % queue.length;
      setIndex(randIdx);
      setPlaying(true);
      return;
    }

    if (index < queue.length - 1) {
      setIndex(i => i + 1);
      setPlaying(true);
    } else {
      // Reached the end of current queue
      if (repeat === "all" || queue.length > 1) {
        setIndex(0);
        setPlaying(true);
      } else if (catalog.length > 0) {
        // Autoplay more songs from catalog
        const currentId = current?._id || current?.title;
        const rest = catalog.filter(s => s._id !== currentId && s.title !== current?.title);
        if (rest.length > 0) {
          setQueue(prev => [...prev, ...rest]);
          setIndex(i => i + 1);
          setPlaying(true);
        } else {
          setIndex(0);
          setPlaying(true);
        }
      } else {
        setIndex(0);
        setPlaying(true);
      }
    }
  }, [queue.length, repeat, shuffle, index, current, catalog]);

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      setProgress(0);
      return;
    }

    if (index > 0) {
      setIndex(i => i - 1);
      setPlaying(true);
    } else {
      setIndex(Math.max(0, queue.length - 1));
      setPlaying(true);
    }
  }, [index, queue.length]);

  const seek = useCallback((targetTime) => {
    const a = audioRef.current;
    if (!a) return;
    const maxDur = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : (duration || 300);
    const target = Math.max(0, Math.min(Number(targetTime), maxDur));
    try {
      a.currentTime = target;
    } catch (e) {
      console.warn("Seek error:", e);
    }
    setProgress(target);
  }, [duration]);

  const seekRelative = useCallback((deltaSeconds) => {
    const a = audioRef.current;
    const cur = a && Number.isFinite(a.currentTime) ? a.currentTime : progress;
    seek(cur + deltaSeconds);
  }, [progress, seek]);

  const setVol = useCallback((v) => {
    const safeVolume = Math.max(0, Math.min(1, Number(v)));
    setVolume(safeVolume);
    setIsMuted(safeVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      const restore = volume > 0 ? volume : 0.8;
      if (audioRef.current) audioRef.current.volume = restore;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  }, [isMuted, volume]);

  const toggleRepeat = useCallback(() => {
    setRepeat(r => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(s => !s);
  }, []);

  const changePlaybackRate = useCallback((rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((targetIdx) => {
    setQueue(prev => {
      const nextQ = prev.filter((_, i) => i !== targetIdx);
      if (targetIdx < index) {
        setIndex(i => Math.max(0, i - 1));
      } else if (targetIdx === index && targetIdx >= nextQ.length) {
        setIndex(Math.max(0, nextQ.length - 1));
      }
      return nextQ;
    });
  }, [index]);

  const playSongAt = useCallback((i) => {
    if (i >= 0 && i < queue.length) {
      setIndex(i);
      setPlaying(true);
    }
  }, [queue.length]);

  // EFFECT 1: Load audio source ONLY when track changes (independent of playing state!)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    if (!current) {
      a.pause();
      a.removeAttribute("src");
      setProgress(0);
      setDuration(0);
      prevTrackKeyRef.current = null;
      return;
    }

    const trackKey = (current._id || "") + "::" + (current.url || "") + "::" + (current.title || "");
    if (prevTrackKeyRef.current === trackKey) {
      return;
    }
    prevTrackKeyRef.current = trackKey;

    const streamUrl = resolveStreamUrl(current.url);
    if (!streamUrl) {
      setError(`No audio stream for "${current.title}". Skipping to next track...`);
      const timer = setTimeout(() => next(), 1500);
      return () => clearTimeout(timer);
    }

    setError("");
    a.pause();
    a.src = streamUrl;
    a.load();
    a.volume = isMuted ? 0 : volume;
    a.playbackRate = playbackRate;
    setProgress(0);
    setDuration(0);

    if (playing) {
      const playPromise = a.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Autoplay deferred or blocked:", err);
          // Don't kill playing state immediately unless unrecoverable
        });
      }
    }
  }, [current]);

  // EFFECT 2: Manage play/pause state without reloading source or resetting currentTime!
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current || !a.src) return;

    if (playing) {
      if (a.paused) {
        const p = a.play();
        if (p !== undefined) {
          p.catch(err => {
            console.warn("Play error:", err);
            setPlaying(false);
          });
        }
      }
    } else {
      if (!a.paused) {
        a.pause();
      }
    }
  }, [playing]);

  // EFFECT 3: Audio event listeners
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => {
      setProgress(a.currentTime || 0);
    };

    const onDuration = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setDuration(a.duration);
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => {
      setIsBuffering(false);
      setPlaying(true);
    };
    const onPause = () => {
      // Only set playing to false if not ended and not seeking
      if (!a.seeking && a.currentTime < (a.duration || 1) - 0.5) {
        setPlaying(false);
      }
    };

    const onEnd = () => {
      if (repeat === "one") {
        a.currentTime = 0;
        a.play().catch(() => {});
        setProgress(0);
        setPlaying(true);
      } else {
        next();
      }
    };

    const onError = () => {
      setIsBuffering(false);
      setError(`Stream unavailable for "${current?.title || 'track'}". Moving to next...`);
      // Auto-advance after 1.5s
      const timer = setTimeout(() => {
        next();
      }, 1500);
      return () => clearTimeout(timer);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDuration);
    a.addEventListener("durationchange", onDuration);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onError);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDuration);
      a.removeEventListener("durationchange", onDuration);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onError);
    };
  }, [current, repeat, next]);

  // EFFECT 4: Track play history in database
  useEffect(() => {
    if (!current || !localStorage.getItem("dm_token")) return;

    client.post("/playlist/history", {
      song_id: current._id || current.song_id || current.title,
      title: current.title,
      artist: current.artist || "",
      cover: current.cover || "",
      genre: current.genre || "",
    }).catch(() => {});
  }, [playSession]);

  // EFFECT 5: Keyboard Shortcuts for Desktop
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      if (!current) return;

      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) {
          next();
        } else {
          seekRelative(10); // Seek forward 10s
        }
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) {
          prev();
        } else {
          seekRelative(-10); // Seek backward 10s
        }
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setVol(Math.min(1, volume + 0.05));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setVol(Math.max(0, volume - 0.05));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, toggle, next, prev, seekRelative, toggleMute, volume, setVol]);

  return (
    <PlayerContext.Provider value={{
      current,
      queue,
      index,
      playing,
      progress,
      duration,
      volume,
      isMuted,
      repeat,
      shuffle,
      playbackRate,
      isBuffering,
      error,
      showQueue,
      setShowQueue,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      seekRelative,
      setVolume: setVol,
      toggleMute,
      toggleRepeat,
      toggleShuffle,
      setPlaybackRate: changePlaybackRate,
      addToQueue,
      removeFromQueue,
      playSongAt
    }}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </PlayerContext.Provider>
  );
}
