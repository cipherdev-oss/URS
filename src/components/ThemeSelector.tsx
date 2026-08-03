import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_ACCENTS, ThemeAccent } from '../lib/theme';
import { Sun, Moon, Palette, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeSelector() {
  const { mode, accent, setMode, setAccent, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAccent = THEME_ACCENTS.find(a => a.id === accent) || THEME_ACCENTS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 dark:bg-slate-950/80 border border-slate-800 rounded-xl">
        {/* Light/Dark Mode Toggle Button */}
        <button
          onClick={toggleMode}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all flex items-center justify-center"
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Accent Selector Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
        >
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shadow-sm transition-transform hover:scale-110"
            style={{ backgroundColor: activeAccent.colorHex }}
          />
          <span className="hidden md:inline text-[11px] font-semibold tracking-wide">
            {activeAccent.name}
          </span>
          <Palette className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 p-3 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl z-50 text-slate-100"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Theme & Palette
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {mode.toUpperCase()}
              </span>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-1.5 mb-3 p-1 bg-slate-950/50 rounded-xl border border-slate-800/60">
              <button
                onClick={() => setMode('dark')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === 'dark'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
              <button
                onClick={() => setMode('light')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === 'light'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Light
              </button>
            </div>

            {/* Accent Colors Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1 block">
                Accent Theme
              </label>
              <div className="grid grid-cols-1 gap-1">
                {THEME_ACCENTS.map((item) => {
                  const isSelected = accent === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAccent(item.id as ThemeAccent);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full ring-2 ring-white/20 shrink-0"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
