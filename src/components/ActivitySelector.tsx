/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pillar, Activity, StudentActivity } from '../types';
import { ACTIVITIES } from '../lib/scoring';
import { Plus, Search, Info } from 'lucide-react';

interface ActivitySelectorProps {
  onAdd: (activityId: string) => void;
  customActivities?: Activity[];
}

export function ActivitySelector({ onAdd, customActivities = [] }: ActivitySelectorProps) {
  const [filter, setFilter] = useState('');
  const [activePillar, setActivePillar] = useState<Pillar | 'All'>('All');

  const allActivities = [...ACTIVITIES, ...customActivities];

  const filteredActivities = allActivities.filter(a => {
    const matchesFilter = a.name.toLowerCase().includes(filter.toLowerCase());
    const matchesPillar = activePillar === 'All' || a.pillar === activePillar;
    return matchesFilter && matchesPillar;
  });

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 flex flex-col h-full">
      <h3 className="font-semibold text-slate-100 mb-4">Add Student Activities</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search activities..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border-none rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {['All', ...Object.values(Pillar)].map((p) => (
          <button
            key={p}
            onClick={() => setActivePillar(p as any)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activePillar === p 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {p === 'All' ? 'All' : p.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {filteredActivities.map((activity) => (
          <div 
            key={activity.id}
            className="group p-3 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mb-0.5">
                {activity.pillar}
              </div>
              <div className="text-sm font-medium text-slate-300 leading-tight">
                {activity.name}
              </div>
              <div className="flex gap-3 mt-1.5">
                <div className="text-[10px] text-slate-500 bg-slate-800 px-1.5 rounded uppercase font-bold">
                  {activity.type}
                </div>
                <div className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                  <Info className="w-3 h-3" />
                  B: {activity.base} {activity.step > 0 && `(D: -${activity.step})`}
                </div>
              </div>
            </div>
            <button
              onClick={() => onAdd(activity.id)}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
