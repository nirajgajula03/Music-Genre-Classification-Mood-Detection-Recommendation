import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import MusicPlayer from "./components/MusicPlayer";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Search from "./pages/Search";
import Recommendations from "./pages/Recommendations";
import SmartPlaylists from "./pages/SmartPlaylists";
import SmartPlaylistDetail from "./pages/SmartPlaylistDetail";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PlayerProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar/>
              <main className="flex-1 pb-28">
                <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="/upload" element={<Upload/>}/>
                  <Route path="/search" element={<Search/>}/>
                  <Route path="/recommend" element={<Recommendations/>}/>
                  <Route path="/smart-playlists" element={<SmartPlaylists/>}/>
                  <Route path="/smart-playlists/:id" element={<SmartPlaylistDetail/>}/>
                  <Route path="/playlists" element={<Playlists/>}/>
                  <Route path="/playlists/:id" element={<PlaylistDetail/>}/>
                  <Route path="/dashboard" element={<Dashboard/>}/>
                  <Route path="/about" element={<About/>}/>
                  <Route path="/login" element={<Login/>}/>
                  <Route path="/register" element={<Register/>}/>
                  <Route path="*" element={<NotFound/>}/>
                </Routes>
              </main>
              <MusicPlayer/>
            </div>
          </BrowserRouter>
        </PlayerProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
