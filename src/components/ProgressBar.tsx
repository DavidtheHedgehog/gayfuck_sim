import React from "react";
import { cn } from "../lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  colorClass?: string;
  showValue?: boolean;
}

export function ProgressBar({ label, value, max = 100, colorClass = "bg-rose-500", showValue = true }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-xs font-semibold text-slate-400">
        <span>{label}</span>
        {showValue && <span className="font-mono">{Math.floor(value)} / {max}</span>}
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div 
          className={cn("h-full transition-all duration-500 origin-left shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
