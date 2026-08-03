/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivitySelector } from './components/ActivitySelector';
import { ScoreDashboard } from './components/ScoreDashboard';
import { YearGroup, Student, StudentActivity, ScoreBreakdown, Pillar, Activity } from './types';
import { calculateScoreBreakdown, ACTIVITIES } from './lib/scoring';
import { Trash2, History, RotateCcw, Award, Users, PlusCircle, LayoutDashboard, ChevronRight, Settings, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaderboard } from './components/Leaderboard';
import { ActivityManager } from './components/ActivityManager';
import { RulesView } from './components/RulesView';

const DUMMY_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Alice Johnson',
    yearGroup: YearGroup.First,
    activities: [
      { activityId: 'gpa_5', count: 1, timestamp: Date.now() },
      { activityId: 'su_pres', count: 1, timestamp: Date.now() },
      { activityId: 'sports_int', count: 1, timestamp: Date.now() },
      { activityId: 'org_tech_ws', count: 1, timestamp: Date.now() },
    ],
    submissionTimestamp: Date.now() - 1000000
  },
  {
    id: 's2',
    name: 'Bob Smith',
    yearGroup: YearGroup.First,
    activities: [
      { activityId: 'gpa_10', count: 1, timestamp: Date.now() },
      { activityId: 'oss_contrib', count: 5, timestamp: Date.now() },
      { activityId: 'cert', count: 2, timestamp: Date.now() },
    ],
    submissionTimestamp: Date.now() - 500000
  }
];

export default function App() {
  const [students, setStudents] = useState<Student[]>(DUMMY_STUDENTS);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(DUMMY_STUDENTS[0].id);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const activeStudent = students.find(s => s.id === activeStudentId);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown>(calculateScoreBreakdown([], []));

  useEffect(() => {
    if (activeStudent) {
      setBreakdown(calculateScoreBreakdown(activeStudent.activities, customActivities));
    }
  }, [activeStudent, customActivities]);

  const handleAddStudent = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newStudent: Student = {
      id,
      name: `Student ${students.length + 1}`,
      yearGroup: YearGroup.First,
      activities: [],
      submissionTimestamp: Date.now()
    };
    setStudents([...students, newStudent]);
    setActiveStudentId(id);
  };

  const handleAddActivity = (activityId: string) => {
    if (!activeStudentId) return;
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudentId) return s;
      const existing = s.activities.find(a => a.activityId === activityId);
      let newActivities;
      if (existing) {
        newActivities = s.activities.map(a => 
          a.activityId === activityId ? { ...a, count: a.count + 1 } : a
        );
      } else {
        newActivities = [...s.activities, { activityId, count: 1, timestamp: Date.now() }];
      }
      return { ...s, activities: newActivities, submissionTimestamp: Date.now() };
    }));
  };

  const handleRemoveOne = (activityId: string) => {
    if (!activeStudentId) return;
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudentId) return s;
      const existing = s.activities.find(a => a.activityId === activityId);
      let newActivities;
      if (existing && existing.count > 1) {
        newActivities = s.activities.map(a => 
          a.activityId === activityId ? { ...a, count: a.count - 1 } : a
        );
      } else {
        newActivities = s.activities.filter(a => a.activityId !== activityId);
      }
      return { ...s, activities: newActivities, submissionTimestamp: Date.now() };
    }));
  };

  const updateStudentMetadata = (updates: Partial<Student>) => {
    if (!activeStudentId) return;
    setStudents(prev => prev.map(s => s.id === activeStudentId ? { ...s, ...updates } : s));
  };

  const deleteStudent = (id: string) => {
    const newStudents = students.filter(s => s.id !== id);
    setStudents(newStudents);
    if (activeStudentId === id) {
      setActiveStudentId(newStudents[0]?.id || null);
    }
  };

  const handleAddCustomActivity = (act: Activity) => setCustomActivities([...customActivities, act]);
  const handleRemoveCustomActivity = (id: string) => setCustomActivities(customActivities.filter(a => a.id !== id));

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-100">
      {/* 1. Left Sidebar: Navigation & Student List */}
      <aside className="w-80 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">LNBTI Simulator</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">v3.0 Multi-Validator</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleAddStudent}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Student
            </button>
            <button 
              onClick={() => setIsRulesOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-2 rounded-xl transition-all"
              title="System Rules"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-2 rounded-xl transition-all"
              title="Configure Activities"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Leaderboard 
            students={students} 
            customActivities={customActivities}
            onSelectStudent={(s) => setActiveStudentId(s.id)}
            activeStudentId={activeStudentId}
          />
        </div>
      </aside>

      {/* 2. Main Content: Analytics & Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeStudent ? (
          <>
            {/* Context Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/20 px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-8">
                <div className="space-y-0.5">
                  <input 
                    className="bg-transparent text-lg font-bold border-none p-0 focus:ring-0 text-slate-100 w-48"
                    value={activeStudent.name}
                    onChange={(e) => updateStudentMetadata({ name: e.target.value })}
                  />
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <select 
                  className="bg-transparent border-none p-0 text-xs font-bold uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer hover:text-slate-300 transition-colors"
                  value={activeStudent.yearGroup}
                  onChange={(e) => updateStudentMetadata({ yearGroup: e.target.value as YearGroup })}
                >
                  {Object.values(YearGroup).map(yg => (
                    <option key={yg} value={yg} className="bg-slate-950 text-slate-100">{yg}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => deleteStudent(activeStudent.id)}
                className="text-slate-600 hover:text-red-500 transition-colors p-2"
                title="Delete Student"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Analytics Panel */}
                <div className="xl:col-span-7 space-y-8">
                  <ScoreDashboard breakdown={breakdown} />
                  
                  {/* Detailed Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto shadow-xl">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Pillar Checksums</h3>
                    <table className="w-full text-xs">
                      <thead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] border-b border-slate-800">
                        <tr>
                          <th className="text-left pb-4">Pillar</th>
                          <th className="text-center pb-4">Raw</th>
                          <th className="text-center pb-4">Capped</th>
                          <th className="text-center pb-4">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {Object.values(Pillar).map(p => (
                          <tr key={p} className="hover:bg-slate-800/30">
                            <td className="py-4 font-medium text-slate-400">{p}</td>
                            <td className="py-4 text-center text-slate-600 font-mono">{breakdown.raw[p].toFixed(1)}</td>
                            <td className="py-4 text-center text-slate-100 font-bold font-mono">{breakdown.capped[p].toFixed(1)}</td>
                            <td className="py-4 text-center">
                              <span className={Number(breakdown.totalCapped > 0 ? (breakdown.capped[p] / breakdown.totalCapped * 100) : 0) >= 39.9 ? "text-amber-500 font-bold" : "text-slate-600"}>
                                {breakdown.totalCapped > 0 ? (breakdown.capped[p] / breakdown.totalCapped * 100).toFixed(1) : "0.0"}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Input Panel */}
                <div className="xl:col-span-5 space-y-6 flex flex-col min-h-0">
                  <div className="h-[400px] shrink-0">
                    <ActivitySelector onAdd={handleAddActivity} customActivities={customActivities} />
                  </div>
                  
                  <div className="flex-1 min-h-[300px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Ledger</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      {activeStudent.activities.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                          No activities recorded.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeStudent.activities.map((sa) => {
                            const activity = [...ACTIVITIES, ...customActivities].find(a => a.id === sa.activityId);
                            return (
                              <div key={sa.activityId} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800 group hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 text-[10px]">
                                    {sa.count}
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-300">{activity?.name}</div>
                                </div>
                                <button onClick={() => handleRemoveOne(sa.activityId)} className="p-1.5 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-700 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-400 mb-2">No Student Selected</h2>
            <p className="text-sm text-slate-600 max-w-xs">Select a student from the sidebar or create a new one to start simulating.</p>
          </div>
        )}

        {/* Rules Overlay */}
        <AnimatePresence>
          {isRulesOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-[110] bg-[#020617] p-12 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-8">
                  <button 
                    onClick={() => setIsRulesOpen(false)}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-slate-100 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    Close Rules
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <RulesView />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Overlay */}
        <AnimatePresence>
          {isConfigOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#020617]/95 backdrop-blur-sm p-12 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-100 tracking-tight">System Configuration</h2>
                    <p className="text-slate-500 text-sm mt-1">Define custom activity rules and diminishing returns parameters.</p>
                  </div>
                  <button 
                    onClick={() => setIsConfigOpen(false)}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-slate-100 transition-all"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                </div>
                <ActivityManager 
                  customActivities={customActivities}
                  onAdd={handleAddCustomActivity}
                  onRemove={handleRemoveCustomActivity}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

