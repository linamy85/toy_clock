/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClockSettings, DifficultyLevel, UserStats } from './types/clock';
import { QuizView } from './components/QuizView';

const DEFAULT_SETTINGS: ClockSettings = {
  showMinuteNumbers: true,
  showMinuteTicks: true,
  showHourZoneColors: true,
  colorCodedHands: true,
  showSecondHand: true,
  timerDuration: 30, // 30秒倒數
  countdownTickSound: true, // 倒數滴答聲
  soundEnabled: true,
};

const DEFAULT_STATS: UserStats = {
  score: 0,
  correctAnswers: 0,
  totalAttempts: 0,
  streak: 0,
  highestStreak: 0,
};

export default function App() {
  const [level, setLevel] = useState<DifficultyLevel>('lv3_five_min');
  const [settings, setSettings] = useState<ClockSettings>(() => {
    try {
      const saved = localStorage.getItem('forest_clock_settings_v2');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('forest_clock_stats_v2');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Sync settings
  useEffect(() => {
    try {
      localStorage.setItem('forest_clock_settings_v2', JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  // Sync stats
  useEffect(() => {
    try {
      localStorage.setItem('forest_clock_stats_v2', JSON.stringify(stats));
    } catch (e) {
      console.warn(e);
    }
  }, [stats]);

  const updateSettings = (newPartial: Partial<ClockSettings>) => {
    setSettings(prev => ({ ...prev, ...newPartial }));
  };

  return (
    <div className="min-h-screen bg-[#F6FAF2] text-slate-800 flex flex-col font-sans selection:bg-emerald-200">
      {/* CLEAN HEADER */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 py-3 px-4 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
              🌲
            </span>
            <h1 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight">
              時鐘大冒險
            </h1>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            看時鐘選時間
          </span>
        </div>
      </header>

      {/* MAIN GAME CONTAINER */}
      <main className="flex-1 max-w-2xl mx-auto w-full py-4 sm:py-6 px-3 sm:px-4 flex flex-col items-center justify-center">
        <QuizView
          level={level}
          onLevelChange={setLevel}
          settings={settings}
          onUpdateSettings={updateSettings}
          stats={stats}
          onUpdateStats={setStats}
        />
      </main>

      {/* CLEAN FOOTER */}
      <footer className="py-3 text-center text-xs text-slate-400 border-t border-emerald-100/60 bg-white/40">
        <span>時鐘大冒險 · 快樂學習看時間</span>
      </footer>
    </div>
  );
}
