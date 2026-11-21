import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth(); const { toast } = useToast(); const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const submit = async (e) => { e.preventDefault(); try { await login(email, password); toast("Welcome back!", "success"); nav("/dashboard"); } catch { toast("Invalid credentials", "error"); } };
  return (
    <form onSubmit={submit} className="max-w-md mx-auto px-4 py-16 glass p-8">
      <h1 className="font-display text-2xl font-bold mb-4">Welcome back</h1>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10" required/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mb-4 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10" required/>
      <button className="btn-primary w-full justify-center">Login</button>
      <div className="text-sm text-slate-400 mt-4">No account? <Link to="/register" className="text-cyan">Register</Link></div>
    </form>
  );
}
