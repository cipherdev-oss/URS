/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, YearGroup, Pillar, Activity } from '../types';
import { rankStudents } from '../lib/scoring';
import { Trophy, Medal, AlertTriangle, User, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeaderboardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  activities?: Activity[];
  customActivities?: Activity[];
  activeStudentId: string | null;
}

export function Leaderboard({ students, onSelectStudent, activities, customActivities = [], activeStudentId }: LeaderboardProps) {
  const years = Object.values(YearGroup);
  const activeActivities = activities || customActivities;

  return (
    <div className="space-y-8">
      {years.map(year => {
        const yearStudents = students.filter(s => s.yearGroup === year);
        const rankings = rankStudents(yearStudents, activeActivities);
        
        return (
          <div key={year} className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
              <span>{year}</span>
              <span className="opacity-50">{yearStudents.length}</span>
            </h3>

            {rankings.length === 0 ? (
              <div className="py-4 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-800/50">
                <p className="text-slate-700 text-[10px] font-bold uppercase tracking-wider">Empty</p>
              </div>
            ) : (
              <div className="space-y-1">
                {rankings.map(({ student, breakdown, rank }) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => onSelectStudent(student)}
                    className={cn(
                      "group cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between",
                      activeStudentId === student.id
                        ? "bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-900/20"
                        : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]",
                        rank === 1 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                        rank === 2 ? "bg-slate-300/20 text-slate-300 border border-slate-300/30" :
                        rank === 3 ? "bg-orange-600/20 text-orange-600 border border-orange-600/30" :
                        "bg-slate-800 text-slate-500"
                      )}>
                        {rank}
                      </div>

                      <div className="overflow-hidden">
                        <div className={cn(
                          "text-xs font-bold truncate",
                          activeStudentId === student.id ? "text-blue-400" : "text-slate-300"
                        )}>
                          {student.name}
                        </div>
                        {!breakdown.passesBalanceGate && (
                          <div className="text-[9px] text-amber-500/70 font-bold uppercase tracking-tighter">
                            Non-Qualifying
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-black font-mono tracking-tight",
                        activeStudentId === student.id ? "text-blue-100" : "text-slate-400"
                      )}>
                        {breakdown.finalScore}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
