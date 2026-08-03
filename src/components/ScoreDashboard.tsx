/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Pillar, ScoreBreakdown } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, TrendingUp, ShieldAlert, Maximize2, X, PieChart, BarChart3, Info, Award, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScoreDashboardProps {
  breakdown: ScoreBreakdown;
}

export function ScoreDashboard({ breakdown }: ScoreDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);

  const pillarsList = Object.values(Pillar);

  const radarData = pillarsList.map(p => {
    const rawVal = breakdown.raw[p] || 0;
    const cappedVal = breakdown.capped[p] || 0;
    const rawPercent = breakdown.totalRaw > 0 ? (rawVal / breakdown.totalRaw) * 100 : 0;
    const cappedPercent = breakdown.totalCapped > 0 ? (cappedVal / breakdown.totalCapped) * 100 : 0;

    return {
      fullPillarName: p,
      pillar: p.split(' ')[0], // Short name for small chart
      raw: Number(rawVal.toFixed(1)),
      capped: Number(cappedVal.toFixed(1)),
      rawPercent: Number(rawPercent.toFixed(1)),
      cappedPercent: Number(cappedPercent.toFixed(1)),
      cappingLoss: Number((rawVal - cappedVal).toFixed(1)),
      passesGate: rawVal >= 20
    };
  });

  const bonusPercent = (breakdown.bonus * 100).toFixed(1);

  // Find max raw pillar
  const maxRawPillarEntry = radarData.reduce((prev, current) => (prev.raw > current.raw) ? prev : current, radarData[0]);
  // Find min raw pillar
  const minRawPillarEntry = radarData.reduce((prev, current) => (prev.raw < current.raw) ? prev : current, radarData[0]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Pentagon Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => setIsModalOpen(true)}
          className="group bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 hover:border-blue-500/50 cursor-pointer relative overflow-hidden transition-all"
        >
          {/* Subtle Hover Callout */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              Expand & Details
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                Pillar Balance (Pentagon)
              </h3>
              <p className="text-[11px] text-slate-500">Click to view enlarged radar & exact percentage details</p>
            </div>
          </div>

          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-blue-500/20 border border-blue-500 rounded-sm" />
              <span className="text-slate-400">Raw</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
              <span className="text-slate-400">Capped</span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Radar
                  name="Raw"
                  dataKey="raw"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                />
                <Radar
                  name="Capped"
                  dataKey="capped"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-center text-[10px] text-slate-500 font-medium group-hover:text-blue-400 transition-colors">
            🔍 Click anywhere on card for full percentage analysis & pillar breakdown
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-full flex flex-col justify-between">
            <div>
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

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <PieChart className="w-4 h-4 text-blue-400" />
              View Full Pentagon Percentage Breakdown
            </button>
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

      {/* EXPANDED PENTAGON & DETAILED ANALYTICS MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col my-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Expanded Pentagon & Pillar Percentages
                    </h2>
                    <p className="text-xs text-slate-400">
                      Detailed section analysis, exact score distributions, and 40% dominance cap audits
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                {/* Top Section: Large Chart + High Level Key Highlights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Large Pentagon Chart */}
                  <div className="lg:col-span-7 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 shadow-inner flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <PieChart className="w-4 h-4 text-blue-400" />
                        Interactive Radar Graph
                      </span>
                      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded-sm" />
                          <span className="text-slate-300">Raw Points</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-emerald-500/80 rounded-sm" />
                          <span className="text-emerald-400">Capped Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis 
                            dataKey="fullPillarName" 
                            tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} 
                          />
                          <PolarRadiusAxis stroke="#475569" angle={30} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Radar
                            name="Raw Points"
                            dataKey="raw"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                          />
                          <Radar
                            name="Capped Score"
                            dataKey="capped"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Highlights Summary Box */}
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pillar Balance Summary</h3>
                    
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Highest Pillar:</span>
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          {maxRawPillarEntry.fullPillarName} ({maxRawPillarEntry.raw} pts)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Lowest Pillar (Min):</span>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {minRawPillarEntry.fullPillarName} ({minRawPillarEntry.raw} pts)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Capping Loss:</span>
                        <span className="text-xs font-bold text-rose-400 font-mono">
                          -{(breakdown.totalRaw - breakdown.totalCapped).toFixed(1)} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Continuity Bonus:</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          +{bonusPercent}% Boost
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20">
                      <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        40% Dominance Capping Rule
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        To guarantee well-rounded performance, no single pillar can account for more than 40% of the total raw points (or &gt; 66.7% of all other 4 pillars combined).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Detailed Percentage & Section Breakdown Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      Detailed Section-by-Section Percentages
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Total Raw: {breakdown.totalRaw.toFixed(1)} pts | Capped: {breakdown.totalCapped.toFixed(1)} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {radarData.map((item) => {
                      const isSelected = selectedPillar === item.fullPillarName;

                      return (
                        <div
                          key={item.fullPillarName}
                          onClick={() => setSelectedPillar(isSelected ? null : item.fullPillarName as Pillar)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3",
                            isSelected
                              ? "bg-blue-600/10 border-blue-500/60 shadow-lg"
                              : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                          )}
                        >
                          <div>
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                              {item.pillar}
                            </div>
                            <div className="text-xs font-semibold text-slate-200 line-clamp-1" title={item.fullPillarName}>
                              {item.fullPillarName}
                            </div>
                          </div>

                          {/* Percentages */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                <span>Raw Share:</span>
                                <span className="font-bold text-slate-200">{item.rawPercent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(item.rawPercent, 100)}%` }} 
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                <span>Capped Share:</span>
                                <span className="font-bold text-emerald-400">{item.cappedPercent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(item.cappedPercent, 100)}%` }} 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Point Stats */}
                          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Raw Points:</span>
                              <span className="text-slate-300 font-bold">{item.raw}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Capped Score:</span>
                              <span className="text-emerald-400 font-bold">{item.capped}</span>
                            </div>
                            {item.cappingLoss > 0 && (
                              <div className="flex justify-between text-[10px] text-rose-400 font-semibold">
                                <span>Cap Reduction:</span>
                                <span>-{item.cappingLoss}</span>
                              </div>
                            )}
                          </div>

                          {/* Gate Status Pill */}
                          <div className="pt-1">
                            {item.passesGate ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Gate Passed (≥20)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                <AlertCircle className="w-3 h-3" /> Need {(20 - item.raw).toFixed(1)} pts
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Close Analytics
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Tooltip for Modal Radar Chart
function CustomChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-mono">
        <div className="font-sans font-bold text-slate-100 border-b border-slate-800 pb-1">
          {data.fullPillarName}
        </div>
        <div className="text-blue-400 flex justify-between gap-4">
          <span>Raw Points:</span>
          <span className="font-bold">{data.raw} pts ({data.rawPercent}%)</span>
        </div>
        <div className="text-emerald-400 flex justify-between gap-4">
          <span>Capped Score:</span>
          <span className="font-bold">{data.capped} pts ({data.cappedPercent}%)</span>
        </div>
        {data.cappingLoss > 0 && (
          <div className="text-rose-400 flex justify-between gap-4 text-[10px]">
            <span>Dominance Cap Reduction:</span>
            <span>-{data.cappingLoss} pts</span>
          </div>
        )}
        <div className="text-slate-400 text-[10px] pt-1">
          {data.passesGate ? "✅ Gate Passed (≥20)" : `⚠️ ${(20 - data.raw).toFixed(1)} pts needed for gate`}
        </div>
      </div>
    );
  }
  return null;
}

