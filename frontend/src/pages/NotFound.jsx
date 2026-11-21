import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="max-w-md mx-auto px-4 py-24 text-center"><div className="text-6xl font-display font-bold">404</div><p className="text-slate-400 mt-2">This track doesn't exist.</p><Link to="/" className="btn-primary mt-6">Back home</Link></div>;
}
