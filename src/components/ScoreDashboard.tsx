/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Pillar, ScoreBreakdown } from '../types';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScoreDashboardProps {
  breakdown: ScoreBreakdown;
}

export function ScoreDashboard({ breakdown }: ScoreDashboardProps) {
  const radarData = Object.values(Pillar).map(p => ({
    pillar: p.split(' ')[0], // Short name
    raw: breakdown.raw[p],
    capped: breakdown.capped[p],
    fullMark: Math.max(breakdown.totalRaw / 2, 50)
  }));

  const bonusPercent = (breakdown.bonus * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-100">Pillar Balance (Pentagon)</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-blue-500/20 border border-blue-500 rounded-sm" />
                <span className="text-slate-500">Raw</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                <span className="text-slate-500">Capped</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Radar
                  name="Raw"
                  dataKey="raw"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Radar
                  name="Capped"
                  dataKey="capped"
                  stroke="#60a5fa"
                  fill="#60a5fa"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-full">
            <h3 className="font-semibold text-slate-100 mb-6 uppercase text-xs tracking-widest text-slate-500">Algorithm Checksums</h3>
            
            <div className="space-y-4">
              {/* Balance Gate */}
              <div className={cn(
                "p-4 rounded-xl border flex items-start gap-3 transition-colors",
                breakdown.passesBalanceGate 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/5 border-amber-500/20 text-amber-400"
              )}>
                {breakdown.passesBalanceGate ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider">Balance Gate</div>
                  <div className="text-[11px] opacity-70 mt-1 leading-relaxed">
                    {breakdown.passesBalanceGate 
                      ? "Qualified for Year Hero ranking." 
                      : `Failing: ${breakdown.pillarsPassingGate.length}/4 pillars reached 20 points.`}
                  </div>
                </div>
              </div>

              {/* Dominance Cap Alert */}
              {breakdown.totalRaw > (breakdown.totalCapped + 0.1) && (
                <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 text-blue-400 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider">Dominance Cap</div>
                    <div className="text-[11px] opacity-70 mt-1 leading-relaxed">
                      Simultaneous fixed-point algorithm applied to normalize mutually dependent pillars.
                    </div>
                  </div>
                </div>
              )}

              {/* Balance Bonus */}
              <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-800 text-slate-400 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider">Continuity Bonus</div>
                  <div className="text-[11px] opacity-70 mt-1 leading-relaxed">
                    {breakdown.bonus > 0 
                      ? `Applying +${bonusPercent}% ramp based on min pillar (${breakdown.minPillar.toFixed(1)}).` 
                      : "Minimum pillar score under 20. No bonus applied."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Score Summary Bar */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-2xl shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-400/20"
      >
        <div className="flex flex-col items-center md:items-start">
          <span className="text-blue-100 text-[10px] font-bold mb-1 uppercase tracking-[0.2em]">Validated Total Score</span>
          <div className="text-6xl font-black tracking-tighter drop-shadow-lg">{breakdown.finalScore}</div>
        </div>

        <div className="flex gap-8 border-l border-white/10 pl-8 overflow-x-auto w-full md:w-auto no-scrollbar">
          <div className="text-center md:text-left shrink-0">
            <div className="text-blue-200 text-[9px] uppercase tracking-widest mb-1 font-bold">Raw</div>
            <div className="text-xl font-bold text-white font-mono">{breakdown.totalRaw.toFixed(1)}</div>
          </div>
          <div className="text-center md:text-left shrink-0">
            <div className="text-blue-200 text-[9px] uppercase tracking-widest mb-1 font-bold">Capped</div>
            <div className="text-xl font-bold text-white font-mono">{breakdown.totalCapped.toFixed(1)}</div>
          </div>
          <div className="text-center md:text-left shrink-0">
            <div className="text-blue-200 text-[9px] uppercase tracking-widest mb-1 font-bold">Bonus</div>
            <div className="text-xl font-bold text-emerald-300 font-mono">+{bonusPercent}%</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
