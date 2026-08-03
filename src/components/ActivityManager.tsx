/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pillar, Activity, ActivityType } from '../types';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityManagerProps {
  customActivities: Activity[];
  onAdd: (activity: Activity) => void;
  onRemove: (id: string) => void;
}

export function ActivityManager({ customActivities, onAdd, onRemove }: ActivityManagerProps) {
  const [name, setName] = useState('');
  const [pillar, setPillar] = useState<Pillar>(Pillar.Academic);
  const [type, setType] = useState<ActivityType>('Active');
  const [base, setBase] = useState(10);
  const [step, setStep] = useState(2);
  const [floor, setFloor] = useState(1);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    const newActivity: Activity = {
      id: `custom_${Math.random().toString(36).substr(2, 9)}`,
      name,
      pillar,
      type,
      base,
      step,
      floor
    };
    
    onAdd(newActivity);
    setName('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Define New Activity Rule
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master's Publication"
              className="w-full bg-slate-800 border-none rounded-xl text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 transition-all px-4 py-3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Pillar</label>
            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value as Pillar)}
              className="w-full bg-slate-800 border-none rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-600 transition-all px-4 py-3 appearance-none cursor-pointer"
            >
              {Object.values(Pillar).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Points</label>
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(Number(e.target.value))}
              className="w-full bg-slate-800 border-none rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-600 transition-all px-4 py-3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Decay Step</label>
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="w-full bg-slate-800 border-none rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-600 transition-all px-4 py-3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Minimum Floor</label>
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(Number(e.target.value))}
              className="w-full bg-slate-800 border-none rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-600 transition-all px-4 py-3"
            />
          </div>

          <div className="lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/40 transition-all"
            >
              Register Activity Type
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Active Custom Rules ({customActivities.length})
        </h3>

        {customActivities.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 italic">
            No custom activities defined yet. Use the form above to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customActivities.map(activity => (
              <motion.div
                layout
                key={activity.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl group relative"
              >
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mb-1">
                  {activity.pillar}
                </div>
                <div className="text-slate-100 font-bold mb-3">{activity.name}</div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-500 uppercase font-black">Base</div>
                    <div className="text-xs font-bold text-slate-200">{activity.base}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-500 uppercase font-black">Step</div>
                    <div className="text-xs font-bold text-slate-200">{activity.step}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-500 uppercase font-black">Floor</div>
                    <div className="text-xs font-bold text-slate-200">{activity.floor}</div>
                  </div>
                </div>

                <button
                  onClick={() => onRemove(activity.id)}
                  className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
