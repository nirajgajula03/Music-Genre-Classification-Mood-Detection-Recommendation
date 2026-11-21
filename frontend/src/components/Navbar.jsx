import { Link, NavLink, useNavigate } from "react-router-dom";
import { Music2, Search, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const links = [
    { to: "/", label: "Home" }, { to: "/upload", label: "Analyze" },
    { to: "/recommend", label: "Recommend" }, { to: "/playlists", label: "Playlists" },
    { to: "/smart-playlists", label: "Smart" }, { to: "/dashboard", label: "Dashboard" },
    { to: "/about", label: "About" },
  ];
  const submitSearch = (e) => { e.preventDefault(); if (searchInput.trim()) nav(`/search?q=${encodeURIComponent(searchInput.trim())}`); setOpen(false); };
  return (
    <header className="sticky top-0 z-50 glass !rounded-none !border-x-0 !border-t-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-cyan"><Music2 size={18}/></span>
          Deep<span className="text-cyan">Music</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:text-white hover:bg-white/5"}`}>{l.label}</NavLink>
          ))}
        </nav>
        <form onSubmit={submitSearch} className="hidden md:flex items-center relative ml-auto">
          <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none"/>
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search songs…" className="w-40 lg:w-56 pl-9 pr-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-cyan focus:outline-none focus:w-64 transition-all"/>
        </form>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:flex items-center gap-2 text-sm text-slate-300"><User size={16}/> {user.name}</span>
              <button onClick={() => { logout(); nav("/"); }} className="btn-primary !py-2"><LogOut size={16}/> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm rounded-lg hover:bg-white/5">Login</Link>
              <Link to="/register" className="btn-primary !py-2">Sign Up</Link>
            </>
          )}
          <button className="lg:hidden p-2" onClick={() => setOpen(o => !o)}><Menu size={20}/></button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden px-4 pb-3 flex flex-col gap-1">
          <form onSubmit={submitSearch} className="relative mb-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search songs…" className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10"/>
          </form>
          {links.map(l => <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">{l.label}</NavLink>)}
        </nav>
      )}
    </header>
  );
}
