import React, { useState, useMemo } from 'react';
import { Student, Activity, Pillar, YearGroup } from '../types';
import { calculateScoreBreakdown, getEffectiveActivities } from '../lib/scoring';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, ArrowUpRight, CheckCircle2, AlertCircle, ShieldAlert, 
  TrendingUp, BarChart3, PieChart, Sliders, ArrowUpDown, Filter, Sparkles, Check, ChevronRight, Scale
} from 'lucide-react';
import { clsx } from 'clsx';

interface StudentComparisonViewProps {
  students: Student[];
  activities: Activity[];
  onSelectStudentForEdit: (studentId: string) => void;
}

type ComparisonMode = 'headToHead' | 'matrix' | 'pillarLeaders';

export function StudentComparisonView({ students, activities, onSelectStudentForEdit }: StudentComparisonViewProps) {
  const [mode, setMode] = useState<ComparisonMode>('headToHead');

  // Head to Head state: select student A and student B (and optional C)
  const [studentAId, setStudentAId] = useState<string>(students[0]?.id || '');
  const [studentBId, setStudentBId] = useState<string>(students[1]?.id || students[0]?.id || '');
  const [studentCId, setStudentCId] = useState<string>(''); // Optional 3rd student

  // Matrix view state
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [gateFilter, setGateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('finalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute breakdown for all students
  const effectiveActs = useMemo(() => getEffectiveActivities(activities), [activities]);

  const studentBreakdowns = useMemo(() => {
    return students.map(s => {
      const breakdown = calculateScoreBreakdown(s.activities, effectiveActs);
      return {
        student: s,
        breakdown
      };
    });
  }, [students, effectiveActs]);

  // Selected students for Head-to-Head
  const studentAData = useMemo(() => studentBreakdowns.find(sb => sb.student.id === studentAId) || studentBreakdowns[0], [studentBreakdowns, studentAId]);
  const studentBData = useMemo(() => studentBreakdowns.find(sb => sb.student.id === studentBId) || studentBreakdowns[1] || studentBreakdowns[0], [studentBreakdowns, studentBId]);
  const studentCData = useMemo(() => studentCId ? studentBreakdowns.find(sb => sb.student.id === studentCId) : null, [studentBreakdowns, studentCId]);

  // Combined Radar Data for Head-to-Head
  const headToHeadRadarData = useMemo(() => {
    if (!studentAData || !studentBData) return [];
    const pillars = Object.values(Pillar);
    return pillars.map(p => ({
      fullPillarName: p,
      pillar: p.split(' ')[0],
      [`${studentAData.student.name}_capped`]: studentAData.breakdown.capped[p] || 0,
      [`${studentAData.student.name}_raw`]: studentAData.breakdown.raw[p] || 0,
      [`${studentBData.student.name}_capped`]: studentBData.breakdown.capped[p] || 0,
      [`${studentBData.student.name}_raw`]: studentBData.breakdown.raw[p] || 0,
      ...(studentCData ? {
        [`${studentCData.student.name}_capped`]: studentCData.breakdown.capped[p] || 0,
        [`${studentCData.student.name}_raw`]: studentCData.breakdown.raw[p] || 0,
      } : {})
    }));
  }, [studentAData, studentBData, studentCData]);

  // Combined Bar Chart Data for Head to Head
  const headToHeadBarData = useMemo(() => {
    if (!studentAData || !studentBData) return [];
    const pillars = Object.values(Pillar);
    return pillars.map(p => ({
      name: p.split(' ')[0],
      fullName: p,
      [studentAData.student.name]: studentAData.breakdown.capped[p] || 0,
      [studentBData.student.name]: studentBData.breakdown.capped[p] || 0,
      ...(studentCData ? { [studentCData.student.name]: studentCData.breakdown.capped[p] || 0 } : {})
    }));
  }, [studentAData, studentBData, studentCData]);

  // Filtered and sorted students for Matrix view
  const filteredMatrixData = useMemo(() => {
    let list = [...studentBreakdowns];
    if (yearFilter !== 'all') {
      list = list.filter(item => item.student.yearGroup === yearFilter);
    }
    if (gateFilter === 'passed') {
      list = list.filter(item => item.breakdown.passesBalanceGate);
    } else if (gateFilter === 'failed') {
      list = list.filter(item => !item.breakdown.passesBalanceGate);
    }

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'finalScore') { valA = a.breakdown.finalScore; valB = b.breakdown.finalScore; }
      else if (sortField === 'totalRaw') { valA = a.breakdown.totalRaw; valB = b.breakdown.totalRaw; }
      else if (sortField === 'minPillar') { valA = a.breakdown.minPillar; valB = b.breakdown.minPillar; }
      else if (sortField === 'academic') { valA = a.breakdown.capped[Pillar.Academic]; valB = b.breakdown.capped[Pillar.Academic]; }
      else if (sortField === 'leadership') { valA = a.breakdown.capped[Pillar.Leadership]; valB = b.breakdown.capped[Pillar.Leadership]; }
      else if (sortField === 'arts') { valA = a.breakdown.capped[Pillar.ArtsSports]; valB = b.breakdown.capped[Pillar.ArtsSports]; }
      else if (sortField === 'tech') { valA = a.breakdown.capped[Pillar.TechInnovation]; valB = b.breakdown.capped[Pillar.TechInnovation]; }
      else if (sortField === 'community') { valA = a.breakdown.capped[Pillar.Community]; valB = b.breakdown.capped[Pillar.Community]; }
      else if (sortField === 'name') { return sortOrder === 'asc' ? a.student.name.localeCompare(b.student.name) : b.student.name.localeCompare(a.student.name); }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [studentBreakdowns, yearFilter, gateFilter, sortField, sortOrder]);

  // Pillar Leaders
  const pillarLeaders = useMemo(() => {
    const pillars = Object.values(Pillar);
    return pillars.map(p => {
      let topStudent = studentBreakdowns[0];
      let maxScore = -1;
      studentBreakdowns.forEach(sb => {
        const score = sb.breakdown.capped[p] || 0;
        if (score > maxScore) {
          maxScore = score;
          topStudent = sb;
        }
      });
      return {
        pillar: p,
        leader: topStudent?.student,
        leaderBreakdown: topStudent?.breakdown,
        score: maxScore
      };
    });
  }, [studentBreakdowns]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-slate-100">Student Comparison Center</h2>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
              Multi-View Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare students side-by-side, analyze pillar distributions, and inspect cohort matrices.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setMode('headToHead')}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              mode === 'headToHead' 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            )}
          >
            <PieChart className="w-3.5 h-3.5" />
            Head-to-Head (Dual Radar)
          </button>
          
          <button
            onClick={() => setMode('matrix')}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              mode === 'matrix' 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Cohort Comparison Matrix
          </button>

          <button
            onClick={() => setMode('pillarLeaders')}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              mode === 'pillarLeaders' 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            Pillar Champions
          </button>
        </div>
      </div>

      {/* MODE 1: HEAD TO HEAD DIRECT COMPARISON */}
      {mode === 'headToHead' && (
        <div className="space-y-8">
          {/* Student Selector Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Select Students to Compare
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student A Selector */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Student A (Blue)</label>
                <select
                  value={studentAId}
                  onChange={(e) => setStudentAId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} disabled={s.id === studentBId || s.id === studentCId}>
                      {s.name} ({s.yearGroup})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student B Selector */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Student B (Emerald)</label>
                <select
                  value={studentBId}
                  onChange={(e) => setStudentBId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} disabled={s.id === studentAId || s.id === studentCId}>
                      {s.name} ({s.yearGroup})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student C Selector (Optional 3rd) */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Student C (Purple - Optional)</label>
                <select
                  value={studentCId}
                  onChange={(e) => setStudentCId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- None (2-Way Compare) --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id} disabled={s.id === studentAId || s.id === studentBId}>
                      {s.name} ({s.yearGroup})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Metric Comparison Cards Grid */}
          {studentAData && studentBData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Final Score Comparison */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Final Score</div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-400">{studentAData.student.name}:</span>
                    <span className="text-lg font-bold font-mono text-blue-400">{studentAData.breakdown.finalScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-400">{studentBData.student.name}:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">{studentBData.breakdown.finalScore.toFixed(1)}</span>
                  </div>
                  {studentCData && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-400">{studentCData.student.name}:</span>
                      <span className="text-lg font-bold font-mono text-purple-400">{studentCData.breakdown.finalScore.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                  Diff: <span className="font-bold text-slate-200">
                    Math.abs({(studentAData.breakdown.finalScore - studentBData.breakdown.finalScore).toFixed(1)}) pts
                  </span> ({studentAData.breakdown.finalScore >= studentBData.breakdown.finalScore ? studentAData.student.name : studentBData.student.name} leads)
                </div>
              </div>

              {/* Card 2: Balance Gate Status */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Balance Gate Status</div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{studentAData.student.name}:</span>
                    {studentAData.breakdown.passesBalanceGate ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Passed</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Failing</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{studentBData.student.name}:</span>
                    {studentBData.breakdown.passesBalanceGate ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Passed</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Failing</span>
                    )}
                  </div>

                  {studentCData && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">{studentCData.student.name}:</span>
                      {studentCData.breakdown.passesBalanceGate ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Passed</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Failing</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                  Requires 4/5 pillars ≥ 20 pts raw.
                </div>
              </div>

              {/* Card 3: Lowest Pillar Score (Min Pillar) */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min Pillar Score</div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{studentAData.student.name}:</span>
                    <span className="text-sm font-bold font-mono text-blue-400">{studentAData.breakdown.minPillar.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{studentBData.student.name}:</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">{studentBData.breakdown.minPillar.toFixed(1)}</span>
                  </div>
                  {studentCData && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">{studentCData.student.name}:</span>
                      <span className="text-sm font-bold font-mono text-purple-400">{studentCData.breakdown.minPillar.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                  Higher min pillar wins rank tie-breakers!
                </div>
              </div>

              {/* Card 4: Continuity Bonus Ramp */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Continuity Bonus %</div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{studentAData.student.name}:</span>
                    <span className="text-sm font-bold font-mono text-blue-400">+{(studentAData.breakdown.bonus * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{studentBData.student.name}:</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">+{(studentBData.breakdown.bonus * 100).toFixed(1)}%</span>
                  </div>
                  {studentCData && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">{studentCData.student.name}:</span>
                      <span className="text-sm font-bold font-mono text-purple-400">+{(studentCData.breakdown.bonus * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                  Ramps up to +10% max bonus score.
                </div>
              </div>
            </div>
          )}

          {/* Charts Row: Overlaid Radar Chart & Grouped Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overlaid Pentagon Radar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Overlaid Radar Comparison (Pentagon)
              </h3>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={headToHeadRadarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="pillar" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis stroke="#475569" angle={30} />
                    <Tooltip content={<CustomHeadToHeadTooltip />} />
                    
                    {/* Student A Radar */}
                    {studentAData && (
                      <Radar
                        name={studentAData.student.name}
                        dataKey={`${studentAData.student.name}_capped`}
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    )}
                    
                    {/* Student B Radar */}
                    {studentBData && (
                      <Radar
                        name={studentBData.student.name}
                        dataKey={`${studentBData.student.name}_capped`}
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    )}

                    {/* Student C Radar */}
                    {studentCData && (
                      <Radar
                        name={studentCData.student.name}
                        dataKey={`${studentCData.student.name}_capped`}
                        stroke="#a855f7"
                        fill="#a855f7"
                        fillOpacity={0.3}
                      />
                    )}
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side-by-Side Pillar Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Pillar-by-Pillar Capped Score Bar Comparison
              </h3>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={headToHeadBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    
                    {studentAData && (
                      <Bar dataKey={studentAData.student.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    )}
                    {studentBData && (
                      <Bar dataKey={studentBData.student.name} fill="#10b981" radius={[4, 4, 0, 0]} />
                    )}
                    {studentCData && (
                      <Bar dataKey={studentCData.student.name} fill="#a855f7" radius={[4, 4, 0, 0]} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: COHORT COMPARISON MATRIX */}
      {mode === 'matrix' && (
        <div className="space-y-6">
          {/* Controls Bar: Filters & Options */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-400 uppercase">Year:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Year Groups</option>
                  {Object.values(YearGroup).map(yg => (
                    <option key={yg} value={yg}>{yg}</option>
                  ))}
                </select>
              </div>

              {/* Gate Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Balance Gate:</span>
                <select
                  value={gateFilter}
                  onChange={(e) => setGateFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Gate Statuses</option>
                  <option value="passed">Passed Gate Only</option>
                  <option value="failed">Failing Gate Only</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500">
              Showing <span className="font-bold text-slate-200">{filteredMatrixData.length}</span> of {students.length} students
            </div>
          </div>

          {/* Comparative Data Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[9px] tracking-[0.15em] border-b border-slate-800">
                <tr>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('name')}>
                    Student {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('finalScore')}>
                    Final Score {sortField === 'finalScore' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4">Gate</th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('minPillar')}>
                    Min Pillar {sortField === 'minPillar' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('academic')}>
                    Academic {sortField === 'academic' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('leadership')}>
                    Leadership {sortField === 'leadership' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('arts')}>
                    Arts & Sports {sortField === 'arts' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('tech')}>
                    Tech & Innov {sortField === 'tech' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('community')}>
                    Community {sortField === 'community' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredMatrixData.map(({ student, breakdown }, idx) => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4 font-sans font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400 font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-100">{student.name}</div>
                            <div className="text-[10px] text-slate-500">{student.yearGroup}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-sm font-bold text-blue-400">{breakdown.finalScore.toFixed(1)}</span>
                        {breakdown.bonus > 0 && (
                          <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            +{(breakdown.bonus * 100).toFixed(0)}%
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-sans">
                        {breakdown.passesBalanceGate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" /> Fail ({breakdown.pillarsPassingGate.length}/4)
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-300">
                        {breakdown.minPillar.toFixed(1)}
                      </td>

                      <td className="p-4 text-slate-300">
                        {breakdown.capped[Pillar.Academic].toFixed(1)}
                      </td>

                      <td className="p-4 text-slate-300">
                        {breakdown.capped[Pillar.Leadership].toFixed(1)}
                      </td>

                      <td className="p-4 text-slate-300">
                        {breakdown.capped[Pillar.ArtsSports].toFixed(1)}
                      </td>

                      <td className="p-4 text-slate-300">
                        {breakdown.capped[Pillar.TechInnovation].toFixed(1)}
                      </td>

                      <td className="p-4 text-slate-300">
                        {breakdown.capped[Pillar.Community].toFixed(1)}
                      </td>

                      <td className="p-4 text-right font-sans">
                        <button
                          onClick={() => onSelectStudentForEdit(student.id)}
                          className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: PILLAR CHAMPIONS */}
      {mode === 'pillarLeaders' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" /> Pillar Champions & Highest Scorer Leaders
            </h3>
            <p className="text-xs text-slate-500">
              Students who hold top individual performance per pillar category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillarLeaders.map(({ pillar, leader, leaderBreakdown, score }) => {
              if (!leader || !leaderBreakdown) return null;

              return (
                <div 
                  key={pillar}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 shadow-xl transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      {pillar}
                    </span>
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{leader.name}</h4>
                    <p className="text-xs text-slate-500">{leader.yearGroup}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-400">Pillar Score:</span>
                    <span className="text-lg font-bold text-emerald-400">{score.toFixed(1)} pts</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Total Final Score:</span>
                      <span className="font-bold text-blue-400">{leaderBreakdown.finalScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance Gate:</span>
                      <span className={leaderBreakdown.passesBalanceGate ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {leaderBreakdown.passesBalanceGate ? "Passed" : "Failing"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectStudentForEdit(leader.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    View Student Profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Tooltip for Head to Head Radar Chart
function CustomHeadToHeadTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-2 font-mono">
        <div className="font-sans font-bold text-slate-100 border-b border-slate-800 pb-1">
          {data.fullPillarName}
        </div>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}:</span>
            <span className="font-bold">{p.value} pts</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
