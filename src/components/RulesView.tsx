/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, Pizza, Scale, Target, Zap, ShieldCheck, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

export function RulesView() {
  const sections = [
    {
      icon: <Pizza className="w-5 h-5 text-amber-500" />,
      title: "The Balanced Pizza Analogy",
      description: "A balanced student is like a complete pizza. We don't just look for cheese (Studies); we look for toppings like Leadership, Sports, Tech, and Community. Excellence in many areas is rewarded over extreme focus in one."
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      title: "Diminishing Returns (DR)",
      description: "Doing the same thing 10 times doesn't give 10x points. The 1st time gives full points (BASE), but each repetition drops the score (STEP) until it hits a floor. This rewards diversity of activities.",
      formula: "Points = max(FLOOR, BASE - (N-1) * STEP)"
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      title: "The Balance Gate",
      description: "To be ranked as a 'Year Hero', you must reach at least 20 points in 4 out of 5 pillars. If you miss this gate, you receive a 'Specialist Certificate' but no rank.",
      constraint: "Requirement: 20+ points in 4+ pillars"
    },
    {
      icon: <Scale className="w-5 h-5 text-purple-500" />,
      title: "40% Dominance Cap",
      description: "No single pillar can contribute more than 40% of your total score. If one pillar is too heavy, its excess points are discarded for ranking. This ensures you remain balanced.",
      formula: "Pillar Score ≤ 0.4 * Total Score"
    },
    {
      icon: <Target className="w-5 h-5 text-rose-500" />,
      title: "Continuity Bonus",
      description: "If you pass the Balance Gate, you earn a bonus of +5% to +10% based on your weakest pillar score. This incentivizes raising your lowest score rather than stopping at the minimum.",
      formula: "Ramp: 20 pts (+5%) → 30 pts (+10%)"
    },
    {
      icon: <RefreshCcw className="w-5 h-5 text-slate-500" />,
      title: "Tie-Breaking & Reset",
      description: "Ties are broken by (1) Higher minimum pillar score, then (2) Earlier submission date. All points reset to zero at the start of every academic year for a fresh start."
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
          <Info className="w-3 h-3" />
          Scoring Logic Documentation
        </div>
        <h2 className="text-4xl font-black text-slate-100 tracking-tight">How the Ranking Works</h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          The LNBTI Student Balanced Ranking System uses a complex algorithm to identify and reward well-rounded student performance.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                {section.icon}
              </div>
              <h3 className="font-bold text-slate-200">{section.title}</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              {section.description}
            </p>

            {(section.formula || section.constraint) && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <code className="text-[10px] font-mono text-blue-400">
                  {section.formula || section.constraint}
                </code>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Simulating Fairness</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          This validator implements the exact fixed-point algorithm specified in SRS v3.0, ensuring 100% parity with the production ranking engine.
        </p>
      </div>
    </div>
  );
}
