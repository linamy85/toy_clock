/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, Settings, Sparkles, Clock, Compass, HelpCircle } from 'lucide-react';
import { ClockSettings, DifficultyLevel, GameMode, UserStats } from './types/clock';
import { QuizView } from './components/QuizView';
import { FreePracticeView } from './components/FreePracticeView';
import { BadgesModal } from './components/BadgesModal';
import { SettingsModal } from './components/SettingsModal';
import { soundEngine } from './utils/audio';

const DEFAULT_SETTINGS: ClockSettings = {
  showMinuteNumbers: true,
  showMinuteTicks: true,
  showHourZoneColors: true,
  colorCodedHands: true,
  showSecondHand: true,
  timerDuration: 30, // 預設開啟 30 秒倒數挑戰
  countdownTickSound: true, // 倒數時發出秒針滴答聲 (Tick-Tock)
  soundEnabled: true,
  displayFormat: 'chinese',
};

const DEFAULT_STATS: UserStats = {
  score: 0,
  correctAnswers: 0,
  totalAttempts: 0,
  streak: 0,
  highestStreak: 0,
  levelMastery: {
    lv1_hour_half: 0,
    lv2_quarter: 0,
    lv3_five_min: 0,
    lv4_exact_min: 0,
    lv5_elapsed_calc: 0,
  },
};

export default function App() {
  const [mode, setMode] = useState<GameMode>('adventure');
  const [level, setLevel] = useState<DifficultyLevel>('lv3_five_min'); // Default engaging elementary level
  const [settings, setSettings] = useState<ClockSettings>(() => {
    try {
      const saved = localStorage.getItem('forest_clock_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          // Guarantee timerDuration is positive (default 30s) so countdown is active
          timerDuration: typeof parsed.timerDuration === 'number' && parsed.timerDuration > 0 ? parsed.timerDuration : 30,
          countdownTickSound: parsed.countdownTickSound ?? true,
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('forest_clock_stats');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forest_clock_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forest_clock_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn(e);
    }
  }, [stats]);

  const updateSettings = (newPartial: Partial<ClockSettings>) => {
    setSettings(prev => ({ ...prev, ...newPartial }));
  };

  return (
    <div className="min-h-screen bg-[#F4F8F1] text-slate-800 flex flex-col font-sans selection:bg-emerald-200 overflow-x-hidden">
      {/* 3-ZONE TOP BAR (Fully Responsive for Mobile, Tablet & Desktop) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 py-2.5 sm:py-3.5">
          {/* Zone 1: Brand Mark & Title */}
          <button
            onClick={() => {
              soundEngine.playPop();
              setMode('adventure');
            }}
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base shadow-sm">
              🌲
            </span>
            <span className="text-base sm:text-xl font-black text-emerald-950 tracking-tight">
              時鐘森林大冒險
            </span>
          </button>

          {/* Zone 2: Navigation Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-bold text-slate-600">
            <button
              onClick={() => {
                soundEngine.playPop();
                setMode('adventure');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                mode === 'adventure'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'hover:text-emerald-800'
              }`}
            >
              闖關冒險
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setMode('free_practice');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                mode === 'free_practice'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'hover:text-emerald-800'
              }`}
            >
              自由撥鐘
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setIsBadgesOpen(true);
              }}
              className="whitespace-nowrap shrink-0 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer py-1"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>榮譽勳章</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setIsSettingsOpen(true);
              }}
              className="whitespace-nowrap shrink-0 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer py-1"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>學習設定</span>
            </button>
          </nav>

          {/* Zone 3: Mobile & Tablet Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Star Score badge */}
            <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="font-mono">{stats.score}</span>
            </div>

            {/* Quick Settings Icon on mobile */}
            <button
              onClick={() => {
                soundEngine.playPop();
                setIsSettingsOpen(true);
              }}
              aria-label="打開設定"
              className="md:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Primary Action Button (Desktop) */}
            <button
              onClick={() => {
                soundEngine.playPop();
                setMode('adventure');
              }}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>立即挑戰</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER (Responsive padding) */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-4 sm:py-6 md:py-8 px-2.5 sm:px-4 md:px-6 flex flex-col justify-center pb-20 md:pb-8">
        {mode === 'adventure' && (
          <QuizView
            level={level}
            onLevelChange={setLevel}
            settings={settings}
            onUpdateSettings={updateSettings}
            stats={stats}
            onUpdateStats={setStats}
            onOpenBadges={() => setIsBadgesOpen(true)}
          />
        )}

        {mode === 'free_practice' && (
          <FreePracticeView
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed on Mobile Phones < 768px for effortless thumb access) */}
      <nav aria-label="手機快捷選單" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            soundEngine.playPop();
            setMode('adventure');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] cursor-pointer ${
            mode === 'adventure' ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[11px]">闖關冒險</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playPop();
            setMode('free_practice');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] cursor-pointer ${
            mode === 'free_practice' ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[11px]">自由撥鐘</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playPop();
            setIsBadgesOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] text-slate-500 font-medium cursor-pointer hover:text-amber-600"
        >
          <Award className="w-5 h-5 text-amber-500" />
          <span className="text-[11px]">勳章館</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playPop();
            setIsSettingsOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] text-slate-500 font-medium cursor-pointer hover:text-slate-800"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">設定</span>
        </button>
      </nav>

      {/* FOOTER (Desktop & Tablet) */}
      <footer className="hidden md:block mt-auto py-4 border-t border-emerald-100 bg-white/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <p>時鐘森林大冒險 · 快樂學習看時鐘</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>支援手機與平板觸控</span>
            <span aria-hidden="true">·</span>
            <span>秒針滴答倒數音效</span>
            <span aria-hidden="true">·</span>
            <span>標準中文語音朗讀</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <BadgesModal
        stats={stats}
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
      />

      <SettingsModal
        settings={settings}
        onUpdateSettings={updateSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
