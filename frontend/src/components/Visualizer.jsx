export default function Visualizer({ active = true }) {
  const bars = Array.from({ length: 40 });
  return (
    <div className="h-8 flex items-end gap-0.5 px-4 overflow-hidden">
      {bars.map((_, i) => (
        <span key={i} className="flex-1 bg-gradient-to-t from-brand to-cyan rounded-t origin-bottom"
          style={{ height: active ? `${20 + Math.abs(Math.sin(i*0.4))*80}%` : "10%", animation: active ? `pulseBar 1s ease-in-out ${i*0.04}s infinite` : "none", transition: "height .2s" }}/>
      ))}
    </div>
  );
}
