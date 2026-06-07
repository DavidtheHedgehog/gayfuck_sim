import React from 'react';
import { 
  Building2, Hospital, Stethoscope, Smartphone, Moon,
  RefreshCw, Trophy, Waves, Flame, Zap, Heart, Pill
} from 'lucide-react';
import { useGameEngine } from './hooks/useGameEngine';
import { EVENTS, ENDINGS } from './data/gameData';
import { ProgressBar } from './components/ProgressBar';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterCreation } from './components/CharacterCreation';
import { cn } from './lib/utils';

export default function App() {
  const { gameState, scrollRef, performMainAction, handleEventChoice, restartGame, setPlayerRoleAndProfile } = useGameEngine();
  
  const currentEnding = gameState.endingId ? ENDINGS.find(e => e.id === gameState.endingId) : null;
  const currentEvent = gameState.currentEventId ? EVENTS.find(e => e.id === gameState.currentEventId) : null;

  if (gameState.playerRole === null) {
    return <CharacterCreation onComplete={setPlayerRoleAndProfile} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-rose-900 selection:text-white flex justify-center">
      <div 
        className={cn(
          "max-w-md w-full min-h-screen relative shadow-2xl bg-slate-900 overflow-hidden flex flex-col transition-all duration-1000 border-x border-slate-800",
          gameState.stats.anxiety > 80 && "backdrop-blur-sm bg-slate-900/90",
          gameState.stats.lust > 80 && "ring-inset ring-2 ring-rose-900/50"
        )}
        style={gameState.stats.anxiety > 80 ? { filter: `blur(${Math.min(3, (gameState.stats.anxiety - 80) / 4)}px)` } : {}}
      >
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">欲望深渊</span>
              <Flame size={18} className="text-rose-500 animate-pulse" />
            </h1>
            <span className="text-xs text-slate-500 font-mono tracking-wider mt-0.5">Survive Day: {gameState.day}</span>
          </div>
          <button 
            onClick={restartGame}
            className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="重开轮回"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {/* Game Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative w-full h-full">
          
          <AnimatePresence mode="wait">
            {!gameState.isGameOver ? (
              <motion.div 
                key="game-loop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full w-full"
              >
                {/* Stats Panel */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 pt-5 pb-5 bg-slate-950/50 flex-shrink-0 border-b border-slate-800 shadow-sm z-10 relative">
                  <ProgressBar label="欲望 (积压)" value={gameState.stats.lust} colorClass="bg-rose-600" />
                  <ProgressBar label="压力 (崩坏)" value={gameState.stats.anxiety} colorClass="bg-purple-600" />
                  <ProgressBar label="健康 (生命体征)" value={gameState.stats.health} colorClass="bg-red-500" />
                  <ProgressBar label="欣快 (多巴胺)" value={gameState.stats.euphoria} colorClass="bg-sky-500" />
                  <div className="col-span-2">
                     <ProgressBar label="本金 ($)" value={gameState.stats.wealth} max={10000} colorClass="bg-emerald-500" showValue={true} />
                  </div>
                  
                  {gameState.infections.length > 0 && (
                     <div className="col-span-2 mt-2 bg-red-950/40 border border-red-900/50 rounded-lg p-2 flex items-center justify-center gap-2 text-red-400">
                        <Stethoscope size={16} />
                        <span className="text-xs font-bold font-mono tracking-wider">[患病状态] 疑似感染 - 身体严重不适，请尽快就医</span>
                     </div>
                  )}
                  {gameState.hasFissure && (
                     <div className="col-span-2 mt-1 bg-red-950/40 border border-red-900/50 rounded-lg p-2 flex items-center justify-center gap-2 text-red-400">
                        <Flame size={16} className="animate-pulse" />
                        <span className="text-xs font-bold font-mono tracking-wider">[严重负面] 下体撕裂(肛裂) - 请尽快就医</span>
                     </div>
                  )}
                  {gameState.hasPrEP && (
                     <div className="col-span-2 mt-1 bg-blue-950/40 border border-blue-900/50 rounded-lg p-2 flex items-center justify-center gap-2 text-blue-400">
                        <Pill size={16} />
                        <span className="text-xs font-bold font-mono tracking-wider">[增益状态] PrEP暴露前预防中 (极大降低感染率)</span>
                     </div>
                  )}
                </div>

                {/* Text logs */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 custom-scrollbar scroll-smooth">
                  {gameState.logs.map((log) => (
                    <div key={log.id} className={cn(
                      "mb-5 leading-relaxed break-words relative",
                      log.type === 'system' && "text-slate-500 text-xs font-mono border-l-[3px] border-slate-700 pl-3 py-1",
                      log.type === 'story' && "text-slate-300 text-[15px] font-medium leading-loose",
                      log.type === 'choice' && "text-rose-400 italic text-sm font-semibold pl-4 before:content-[''] before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full before:absolute before:left-0 before:top-2 opacity-90",
                      log.type === 'warning' && "text-red-300 font-bold bg-red-950/40 p-3.5 rounded-xl text-sm border border-red-900/50",
                      log.type === 'effect' && "text-emerald-500 text-sm font-mono"
                    )}>
                      {log.text.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex-shrink-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative">
                  {/* Fading overlay to soften text scroll border */}
                  <div className="absolute top-[-30px] left-0 w-full h-[30px] bg-gradient-to-b from-transparent to-slate-950 pointer-events-none" />

                  {currentEvent ? (
                    <div className="flex flex-col gap-2.5">
                       {currentEvent.choices.map((choice, idx) => {
                         const isAvailable = !choice.condition || choice.condition(gameState);
                         const cText = typeof choice.text === 'function' ? choice.text(gameState) : choice.text;
                         return (
                           <button
                             key={idx}
                             disabled={!isAvailable}
                             onClick={() => handleEventChoice(idx)}
                             className={cn(
                               "w-full text-left px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all group overflow-hidden relative",
                               isAvailable 
                                 ? "bg-slate-800 text-slate-200 hover:bg-rose-950/50 hover:text-rose-300 hover:shadow-lg active:scale-[0.98] border border-slate-700 hover:border-rose-900/50" 
                                 : "bg-slate-900/50 text-slate-600 cursor-not-allowed border border-transparent"
                             )}
                           >
                             <span className="relative z-10 group-hover:translate-x-1.5 inline-block transition-transform duration-300">{cText}</span>
                             {isAvailable && <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                           </button>
                         );
                       })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => performMainAction('app')}
                        className="flex flex-col items-center gap-2.5 p-4 rounded-[1.25rem] bg-rose-950/40 text-rose-400 border border-rose-900/60 hover:bg-rose-900/60 transition-all active:scale-[0.97] shadow-sm relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent group-hover:opacity-100 opacity-50" />
                        <Smartphone size={24} className="relative z-10" />
                        <span className="text-[13px] tracking-wide font-bold relative z-10">猎取对象 [软件]</span>
                      </button>
                      <button
                        onClick={() => performMainAction('bathhouse')}
                        className="flex flex-col items-center gap-2.5 p-4 rounded-[1.25rem] bg-pink-950/40 text-pink-400 border border-pink-900/50 hover:bg-pink-900/60 transition-all active:scale-[0.97] shadow-sm relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent group-hover:opacity-100 opacity-50" />
                        <Waves size={24} className="relative z-10" />
                        <span className="text-[13px] tracking-wide font-bold relative z-10">肉身沉沦 [暗房]</span>
                      </button>
                      <button
                        onClick={() => performMainAction('solo')}
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-orange-950/30 text-orange-500 border border-orange-900/50 hover:bg-orange-900/50 transition-all active:scale-[0.97] col-span-2 shadow-sm"
                      >
                        <Zap size={20} />
                        <span className="text-xs font-bold">玩具排解 (使用幻龙等 -$150)</span>
                      </button>
                      
                      <button
                        onClick={() => performMainAction('hospital')}
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/50 transition-all active:scale-[0.97]"
                      >
                        <Stethoscope size={20} />
                        <span className="text-xs font-bold">医院排雷 ($500)</span>
                      </button>
                      <button
                        onClick={() => performMainAction('work')}
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all active:scale-[0.97]"
                      >
                        <Building2 size={20} />
                        <span className="text-xs font-bold">麻木搬砖赚费</span>
                      </button>

                      <button
                        onClick={() => performMainAction('relationship')}
                        className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-violet-950/40 text-violet-400 border border-violet-900/60 hover:bg-violet-900/50 transition-all active:scale-[0.97] col-span-2 shadow-sm"
                      >
                        <Heart size={20} />
                        <span className="text-xs font-bold tracking-wide">
                          {gameState.partnerId ? "陪伴侣平淡度日 (降压解欲)" : "结束海王生涯 (接受追求者告白)"}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => performMainAction('rest')}
                        className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-indigo-950/40 text-indigo-400 border border-indigo-900/60 hover:bg-indigo-900/50 transition-all active:scale-[0.97] col-span-2 shadow-sm"
                      >
                        <Moon size={20} />
                        <span className="text-xs font-bold tracking-wide">躺平抗压 (休息回血 -$100)</span>
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <motion.div 
                key="ending-screen"
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                className="flex flex-col items-center justify-center p-8 min-h-full h-full text-center bg-slate-950/90 z-50 absolute inset-0 max-w-md mx-auto"
              >
                <motion.div 
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(225,29,72,0.3)] bg-rose-950 text-rose-500 ring-4 ring-rose-900/50 border-4 border-slate-950 relative">
                    <Trophy size={44} strokeWidth={1.5} className="mr-1" />
                  </div>
                  <h2 className="text-3xl font-black mb-1.5 tracking-tight text-white">
                    {currentEnding?.title || '终局'}
                  </h2>
                  <p className="font-mono text-rose-500 text-sm mb-6 uppercase tracking-widest font-bold">Game Over</p>

                  <div className="text-slate-300 leading-loose max-w-[280px] w-full text-[15px] text-justify bg-slate-900 p-7 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden mb-12">
                    <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-rose-500 to-purple-600 rounded-l-2xl" />
                    {currentEnding?.description || '你在深渊中迎来了终结。'}
                    
                    <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-col gap-2">
                       <div className="flex justify-between items-center bg-slate-950/50 px-3 py-2 rounded-lg">
                          <span className="text-xs text-slate-500 font-mono">生存天数</span>
                          <span className="text-sm font-bold text-slate-200">{gameState.day} 天</span>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={restartGame}
                    className="w-[280px] py-4 rounded-xl bg-rose-600 text-white font-bold tracking-widest hover:bg-rose-500 transition-all active:scale-[0.98] shadow-lg shadow-rose-600/20"
                  >
                    重新坠入轮回
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
