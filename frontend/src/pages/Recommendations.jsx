
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../api/client";
import SongCard from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";

export default function Recommendations() {
  const [params] = useSearchParams();
  const p = usePlayer();

  const genre = params.get("genre") || "pop";
  const mood = params.get("mood") || "happy";

  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError("");
      setRecs([]);

      try {
        const response = await client.get("/recommend", {
          params: { genre, mood }
        });

        if (active) {
          setRecs(response.data.recommendations || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.detail ||
            "Could not load recommendations. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      active = false;
    };
  }, [genre, mood]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold">
        Recommendations
      </h1>

      <p className="text-slate-400 mt-1 capitalize">
        Matching <span className="text-cyan">{genre}</span>
        {" + "}
        <span className="text-cyan">{mood}</span> vibe
      </p>

      {loading && (
        <div className="mt-8 text-slate-400">
          Curating songs...
        </div>
      )}

      {!loading && error && (
        <div className="glass mt-8 p-5 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && recs.length === 0 && (
        <div className="glass mt-8 p-6 text-center">
          <h2 className="text-xl font-semibold">
            No recommendations found
          </h2>
          <p className="text-slate-400 mt-2">
            Try analyzing another song to discover more music.
          </p>
        </div>
      )}

      {!loading && !error && recs.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => p?.playQueue(recs, 0)}
              className="btn-primary !py-2 text-sm"
            >
              Play All Recommendations ({recs.length})
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {recs.map((song, i) => (
              <SongCard
                key={song._id || song.title + song.artist + i}
                song={song}
                queue={recs}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
