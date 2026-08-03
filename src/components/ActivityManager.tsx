/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pillar, Activity, ActivityType } from '../types';
import { ACTIVITIES } from '../lib/scoring';
import { Plus, Trash2, Settings2, Edit2, RotateCcw, Check, X, Search, Sliders, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityManagerProps {
  activities: Activity[];
  onAdd: (activity: Activity) => void;
  onUpdate: (activity: Activity) => void;
  onRemove: (id: string) => void;
  onResetAll: () => void;
  onResetItem: (id: string) => void;
}

export function ActivityManager({ 
  activities, 
  onAdd, 
  onUpdate, 
  onRemove, 
  onResetAll,
  onResetItem 
}: ActivityManagerProps) {
  const [filter, setFilter] = useState('');
  const [activePillar, setActivePillar] = useState<Pillar | 'All'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New activity state
  const [newName, setNewName] = useState('');
  const [newPillar, setNewPillar] = useState<Pillar>(Pillar.Academic);
  const [newType, setNewType] = useState<ActivityType>('Active');
  const [newBase, setNewBase] = useState(10);
  const [newStep, setNewStep] = useState(2);
  const [newFloor, setNewFloor] = useState(1);
  const [newHardCap, setNewHardCap] = useState<number | ''>('');

  // Editing activity state
  const [editForm, setEditForm] = useState<Activity | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const newActivity: Activity = {
      id: `custom_${Math.random().toString(36).substr(2, 9)}`,
      name: newName.trim(),
      pillar: newPillar,
      type: newType,
      base: newBase,
      step: newStep,
      floor: newFloor,
      hardCap: newHardCap === '' ? undefined : Number(newHardCap)
    };
    
    onAdd(newActivity);
    setNewName('');
    setNewHardCap('');
    setShowAddForm(false);
  };

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditForm({ ...activity });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editForm.name.trim()) return;
    onUpdate({
      ...editForm,
      name: editForm.name.trim(),
      hardCap: editForm.hardCap ? Number(editForm.hardCap) : undefined
    });
    setEditingId(null);
    setEditForm(null);
  };

  const filteredActivities = activities.filter(a => {
    const matchesFilter = a.name.toLowerCase().includes(filter.toLowerCase()) || 
                          a.pillar.toLowerCase().includes(filter.toLowerCase());
    const matchesPillar = activePillar === 'All' || a.pillar === activePillar;
    return matchesFilter && matchesPillar;
  });

  const isDefaultActivity = (id: string) => ACTIVITIES.some(a => a.id === id);
  
  const isModifiedActivity = (act: Activity) => {
    const original = ACTIVITIES.find(a => a.id === act.id);
    if (!original) return false;
    return (
      original.base !== act.base ||
      original.step !== act.step ||
      original.floor !== act.floor ||
      original.hardCap !== act.hardCap ||
      original.name !== act.name ||
      original.pillar !== act.pillar ||
      original.type !== act.type
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Control Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            Activity Rule Configurations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize base points, decay steps, floors, or add custom activities for all 5 pillars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetAll}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-700"
            title="Reset all activity rules to standard system defaults"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            Reset Defaults
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Form' : 'Add Activity'}
          </button>
        </div>
      </div>

      {/* Add New Activity Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 border border-blue-500/30 p-8 rounded-2xl shadow-2xl relative">
              <h3 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Create Custom Activity
              </h3>

              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Master's Publication or Robotics Captain"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Pillar</label>
                  <select
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value as Pillar)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm cursor-pointer"
                  >
                    {Object.values(Pillar).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ActivityType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Passive">Passive</option>
                    <option value="Milestone">Milestone</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Points</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newBase}
                    onChange={(e) => setNewBase(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decay Step (- Points)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.5"
                    value={newStep}
                    onChange={(e) => setNewStep(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Floor Points</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hard Cap (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="None"
                    value={newHardCap}
                    onChange={(e) => setNewHardCap(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all px-4 py-2.5 text-sm font-mono"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-all"
                  >
                    Save New Activity
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pillar Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          {['All', ...Object.values(Pillar)].map((p) => (
            <button
              key={p}
              onClick={() => setActivePillar(p as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activePillar === p 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === 'All' ? 'All Pillars' : p.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search rules..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map(activity => {
          const isDefault = isDefaultActivity(activity.id);
          const isModified = isModifiedActivity(activity);
          const isEditing = editingId === activity.id;

          if (isEditing && editForm) {
            return (
              <form 
                key={activity.id}
                onSubmit={saveEdit}
                className="bg-slate-900 border-2 border-blue-500 p-5 rounded-2xl shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Editing Rule</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="submit"
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                      title="Save Changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Activity Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs px-3 py-1.5 font-medium mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Pillar</label>
                      <select
                        value={editForm.pillar}
                        onChange={(e) => setEditForm({ ...editForm, pillar: e.target.value as Pillar })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs px-2 py-1.5 mt-1 cursor-pointer"
                      >
                        {Object.values(Pillar).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Type</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as ActivityType })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs px-2 py-1.5 mt-1 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Passive">Passive</option>
                        <option value="Milestone">Milestone</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Base</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.base}
                        onChange={(e) => setEditForm({ ...editForm, base: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs p-1.5 font-mono text-center mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Step</label>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={editForm.step}
                        onChange={(e) => setEditForm({ ...editForm, step: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs p-1.5 font-mono text-center mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Floor</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.floor}
                        onChange={(e) => setEditForm({ ...editForm, floor: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs p-1.5 font-mono text-center mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Cap</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="∞"
                        value={editForm.hardCap ?? ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          hardCap: e.target.value === '' ? undefined : Number(e.target.value) 
                        })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs p-1.5 font-mono text-center mt-1"
                      />
                    </div>
                  </div>
                </div>
              </form>
            );
          }

          return (
            <motion.div
              layout
              key={activity.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between group transition-all relative ${
                isModified 
                  ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500' 
                  : isDefault 
                  ? 'border-slate-800 hover:border-slate-700' 
                  : 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                    {activity.pillar}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {isModified && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider border border-amber-500/30">
                        Modified
                      </span>
                    )}
                    {!isDefault && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider border border-blue-500/30">
                        Custom
                      </span>
                    )}
                    {isDefault && !isModified && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                        Standard
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-100 mb-4 leading-snug">
                  {activity.name}
                </h4>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-black">Base</div>
                    <div className="text-xs font-bold text-slate-200 font-mono">{activity.base}</div>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-black">Step</div>
                    <div className="text-xs font-bold text-slate-200 font-mono">-{activity.step}</div>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-black">Floor</div>
                    <div className="text-xs font-bold text-slate-200 font-mono">{activity.floor}</div>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-black">Cap</div>
                    <div className="text-xs font-bold text-slate-200 font-mono">{activity.hardCap ?? '∞'}</div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Type: <span className="text-slate-400">{activity.type}</span>
                </span>

                <div className="flex items-center gap-1">
                  {isModified && isDefault && (
                    <button
                      onClick={() => onResetItem(activity.id)}
                      className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                      title="Reset parameters to original default"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => startEdit(activity)}
                    className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                    title="Edit Activity Parameters"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!isDefault && (
                    <button
                      onClick={() => onRemove(activity.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Custom Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
          No activities match your search filter.
        </div>
      )}
    </div>
  );
}
