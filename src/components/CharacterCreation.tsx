import React, { useState } from 'react';
import { KINKS } from '../lib/npcGenerator';
import { cn } from '../lib/utils';
import { Dices } from 'lucide-react';

interface CharacterCreationProps {
  onComplete: (role: 'top' | 'bottom' | 'vers', profile: {charm: number, length: number, hardness: number, fetishes: string[]}) => void;
}

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [role, setRole] = useState<'top' | 'bottom' | 'vers' | null>(null);
  const [fetishes, setFetishes] = useState<string[]>([]);
  
  const [stats, setStats] = useState<{charm: number, length: number, hardness: number}>({
    charm: 60,
    length: 15,
    hardness: 8
  });

  const rollStats = () => {
    setStats({
      charm: 50 + Math.floor(Math.random() * 50),
      length: 10 + Math.floor(Math.random() * 12), // 10-21 doesn't matter too much
      hardness: 6 + Math.floor(Math.random() * 5)
    });
  };

  const toggleFetish = (f: string) => {
    if (fetishes.includes(f)) {
      setFetishes(fetishes.filter(x => x !== f));
    } else {
      if (fetishes.length < 3) {
        setFetishes([...fetishes, f]);
      }
    }
  };

  const handleSubmit = () => {
    if (role && fetishes.length > 0) {
      onComplete(role, { ...stats, fetishes });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-500 to-rose-500 bg-clip-text text-transparent mb-6 tracking-tight relative z-10 text-center">
          塑造你的化身
        </h1>
        
        <div className="space-y-6 relative z-10 w-full overflow-y-auto max-h-[80vh] custom-scrollbar pr-2 pb-4">
          
          {/* Role Selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest pl-1">1. 你的身份</h2>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setRole('top')} className={cn("py-3 px-2 rounded-xl border transition-all text-sm font-medium", role === 'top' ? "bg-emerald-900/40 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700")}>
                主导者 (Top)
              </button>
              <button onClick={() => setRole('vers')} className={cn("py-3 px-2 rounded-xl border transition-all text-sm font-medium", role === 'vers' ? "bg-sky-900/40 border-sky-500 text-sky-400" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700")}>
                互攻 (Vers)
              </button>
              <button onClick={() => setRole('bottom')} className={cn("py-3 px-2 rounded-xl border transition-all text-sm font-medium", role === 'bottom' ? "bg-rose-900/40 border-rose-500 text-rose-400" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700")}>
                承受者 (Btm)
              </button>
            </div>
          </div>

          {/* Body Stats */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end pl-1 mb-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">2. 你的硬件指标</h2>
              <button onClick={rollStats} className="text-xs flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors">
                <Dices size={14} />
                重新Röll
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
               <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                 <div className="text-[10px] text-slate-400 mb-1">颜值</div>
                 <div className="font-mono text-lg text-emerald-400 font-bold">{stats.charm}</div>
               </div>
               <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                 <div className="text-[10px] text-slate-400 mb-1">长度 (cm)</div>
                 <div className="font-mono text-lg text-rose-400 font-bold">{stats.length}</div>
               </div>
               <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                 <div className="text-[10px] text-slate-400 mb-1">硬度 (1-10)</div>
                 <div className="font-mono text-lg text-purple-400 font-bold">{stats.hardness}</div>
               </div>
            </div>
          </div>

          {/* Fetishes */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end pl-1 mb-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">3. 你的特殊偏好 <span className="text-rose-500 lowercase">({fetishes.length}/3)</span></h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {KINKS.map(k => {
                const isSelected = fetishes.includes(k);
                return (
                  <button 
                    key={k} 
                    onClick={() => toggleFetish(k)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs transition-all border", 
                      isSelected 
                        ? "bg-rose-900/40 border-rose-500/50 text-rose-300 pointer-events-auto" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    {k}
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-slate-500 pl-1">拥有共同偏好的对象会令你获得加倍的欣快度。</p>
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <button 
              disabled={!role || fetishes.length === 0}
              onClick={handleSubmit} 
              className={cn(
                "w-full py-4 rounded-xl font-bold tracking-widest transition-all shadow-lg",
                (role && fetishes.length > 0) ? "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20" : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 shadow-none"
              )}
            >
              踏入深渊
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
