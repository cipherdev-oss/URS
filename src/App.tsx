/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivitySelector } from './components/ActivitySelector';
import { ScoreDashboard } from './components/ScoreDashboard';
import { YearGroup, Student, StudentActivity, ScoreBreakdown, Pillar, Activity } from './types';
import { calculateScoreBreakdown, ACTIVITIES, getMaxCountForActivity, getEffectiveActivities } from './lib/scoring';
import { Trash2, History, RotateCcw, Award, Users, PlusCircle, LayoutDashboard, ChevronRight, Settings, Info, AlertTriangle, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaderboard } from './components/Leaderboard';
import { ActivityManager } from './components/ActivityManager';
import { RulesView } from './components/RulesView';
import { ChatBot } from './components/ChatBot';

const STORAGE_STUDENTS_KEY = 'scoring_students_v3';
const STORAGE_ACTIVITIES_KEY = 'scoring_activities_v3';

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
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved students", e);
    }
    return DUMMY_STUDENTS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVITIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved activities", e);
    }
    return ACTIVITIES;
  });

  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => students[0]?.id || null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
  } | null>(null);

  // Auto dismiss toast after 5 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Persist students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(students));
    } catch (e) {
      console.error("Failed to persist students", e);
    }
  }, [students]);

  // Persist activities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error("Failed to persist activities", e);
    }
  }, [activities]);

  const activeStudent = students.find(s => s.id === activeStudentId);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown>(calculateScoreBreakdown([], []));

  useEffect(() => {
    if (activeStudent) {
      setBreakdown(calculateScoreBreakdown(activeStudent.activities, activities));
    }
  }, [activeStudent, activities]);

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
    
    const allEffective = getEffectiveActivities(activities);
    const act = allEffective.find(a => a.id === activityId);
    if (!act) return;

    const currentStudent = students.find(s => s.id === activeStudentId);
    if (!currentStudent) return;

    const existing = currentStudent.activities.find(a => a.activityId === activityId);
    const currentCount = existing ? existing.count : 0;
    const maxCount = getMaxCountForActivity(act);

    if (currentCount >= maxCount) {
      setToastNotification({
        id: Date.now().toString(),
        title: 'Activity Cap Limit Reached',
        message: `Cannot add more "${act.name}". Limit of ${maxCount} ${maxCount === 1 ? 'entry' : 'entries'} ${act.hardCap !== undefined ? `(${act.hardCap} pts cap)` : ''} has been reached for this student.`
      });
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudentId) return s;
      const exists = s.activities.find(a => a.activityId === activityId);
      let newActivities;
      if (exists) {
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

  const handleDeleteActivityAll = (activityId: string) => {
    if (!activeStudentId) return;
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudentId) return s;
      return { 
        ...s, 
        activities: s.activities.filter(a => a.activityId !== activityId), 
        submissionTimestamp: Date.now() 
      };
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

  const handleAddActivityRule = (newAct: Activity) => {
    setActivities(prev => [...prev, newAct]);
  };

  const handleUpdateActivityRule = (updatedAct: Activity) => {
    setActivities(prev => prev.map(a => a.id === updatedAct.id ? updatedAct : a));
  };

  const handleRemoveActivityRule = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleResetAllRules = () => {
    setActivities(ACTIVITIES);
  };

  const handleResetItemRule = (id: string) => {
    const original = ACTIVITIES.find(a => a.id === id);
    if (original) {
      setActivities(prev => prev.map(a => a.id === id ? { ...original } : a));
    }
  };

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
            activities={activities}
            onSelectStudent={(s) => setActiveStudentId(s.id)}
            activeStudentId={activeStudentId}
          />
        </div>
      </aside>

      {/* 2. Main Content: Analytics & Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Floating Cap Notification Toast */}
        <AnimatePresence>
          {toastNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 right-8 z-[200] max-w-md bg-amber-950/90 border border-amber-500/50 text-amber-100 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3"
            >
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-2">
                <h4 className="text-sm font-bold text-amber-200">{toastNotification.title}</h4>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">{toastNotification.message}</p>
              </div>
              <button 
                onClick={() => setToastNotification(null)}
                className="p-1 text-amber-400 hover:text-amber-100 hover:bg-amber-500/20 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
                  <div className="h-[550px] shrink-0">
                    <ActivitySelector 
                      onAdd={handleAddActivity} 
                      activities={activities}
                      currentStudentActivities={activeStudent?.activities} 
                    />
                  </div>
                  
                  <div className="flex-1 min-h-[300px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-500" />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Ledger</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                        {activeStudent.activities.reduce((sum, a) => sum + a.count, 0)} Total Logged
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      {activeStudent.activities.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                          No activities recorded for {activeStudent.name}.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeStudent.activities.map((sa) => {
                            const activity = activities.find(a => a.id === sa.activityId) || ACTIVITIES.find(a => a.id === sa.activityId);
                            if (!activity) return null;
                            const maxCount = getMaxCountForActivity(activity);
                            const isAtCap = sa.count >= maxCount;

                            return (
                              <div key={sa.activityId} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isAtCap ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold font-mono text-xs ${
                                    isAtCap ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-blue-400 border-slate-700'
                                  }`}>
                                    {sa.count}
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-slate-200">{activity.name}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                      <span>{activity.pillar}</span>
                                      <span>•</span>
                                      <span className={isAtCap ? "text-amber-400 font-bold" : "text-slate-500"}>
                                        {isAtCap ? `Cap Reached (${sa.count}/${maxCount})` : `Count: ${sa.count} / ${maxCount === Infinity ? '∞' : maxCount}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => handleRemoveOne(sa.activityId)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                                    title="Decrease Count"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleAddActivity(sa.activityId)}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      isAtCap 
                                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30' 
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                                    }`}
                                    title={isAtCap ? `Max Cap Reached (${sa.count}/${maxCount})` : "Increase Count"}
                                  >
                                    {isAtCap ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5" />}
                                  </button>

                                  <button 
                                    onClick={() => handleDeleteActivityAll(sa.activityId)} 
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ml-1"
                                    title="Remove from Ledger"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
                  activities={activities}
                  onAdd={handleAddActivityRule}
                  onUpdate={handleUpdateActivityRule}
                  onRemove={handleRemoveActivityRule}
                  onResetAll={handleResetAllRules}
                  onResetItem={handleResetItemRule}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating AI System Chatbot */}
      <ChatBot />
    </div>
  );
}

