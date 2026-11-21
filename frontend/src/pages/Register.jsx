
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      await register(name, email, password);
      toast("Account created!", "success");
      nav("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        "Registration failed";

      toast(message, "error");
      console.error("Registration error:", err.response?.data || err);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto px-4 py-16 glass p-8">
      <h1 className="font-display text-2xl font-bold mb-4">
        Create your account
      </h1>

      <input
        placeholder="Name (min 2 chars)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
        required
      />

      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
        required
      />

      <button className="btn-primary w-full justify-center">
        Sign Up
      </button>

      <div className="text-sm text-slate-400 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-cyan">
          Login
        </Link>
      </div>
    </form>
  );
}
