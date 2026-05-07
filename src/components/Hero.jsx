import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleRitualize = () => {
    if (username.trim()) {
      navigate(`/profile/${username.trim()}`);
    }
  };

  return (
    <section className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-3">
        <svg className="w-12 h-12 text-[#39ff88] drop-shadow-[0_0_10px_rgba(57,255,136,0.7)]" viewBox="0 0 60 60" fill="none">
           {/* Masukkan SVG path dari main.html di sini */}
        </svg>
        <div className="text-left font-mono">
          <h1 className="text-2xl font-bold tracking-widest">RITCORD</h1>
          <p className="text-[9px] text-[#39ff88] tracking-tighter">RITUAL DISCORD TRACKER</p>
        </div>
      </div>
      
      <p className="text-sm text-white/40 max-w-sm">Lihat profil Ritual Discord kamu — stats, rank, kontribusi, dan lebih.</p>

      <div className="flex w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-lg overflow-hidden focus-within:border-pink-500/50">
        <div className="flex items-center px-4 text-white/20 font-mono text-xs">discord.gg/</div>
        <input 
          className="flex-1 bg-transparent p-3 outline-none font-mono text-sm"
          placeholder="username_kamu"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRitualize()}
        />
        <button 
          onClick={handleRitualize}
          className="bg-[#d946ef] px-5 font-bold text-sm hover:bg-magenta-600 transition-colors"
        >
          Ritualize
        </button>
      </div>
    </section>
  );
}