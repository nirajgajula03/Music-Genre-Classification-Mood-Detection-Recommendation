import { useRef, useState } from "react";
import { UploadCloud, FileAudio } from "lucide-react";

export default function UploadZone({ onFile }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const [name, setName] = useState("");
  const handle = (file) => {
    if (!file) return;
    if (!["audio/mpeg","audio/wav","audio/x-wav"].includes(file.type)) { alert("Only MP3 or WAV files are supported."); return; }
    setName(file.name); onFile(file);
  };
  return (
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
      className={`glass p-8 text-center cursor-pointer transition ${drag ? "border-cyan" : ""}`}
      onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" className="hidden" onChange={(e) => handle(e.target.files?.[0])}/>
      {name ? (
        <div className="flex flex-col items-center gap-2"><FileAudio size={40} className="text-cyan"/><div className="font-medium">{name}</div><div className="text-xs text-slate-400">Click to replace</div></div>
      ) : (
        <div className="flex flex-col items-center gap-2"><UploadCloud size={40} className="text-brand"/><div className="font-medium">Drop your audio here</div><div className="text-xs text-slate-400">MP3 or WAV · max 25MB</div></div>
      )}
    </div>
  );
}
