/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { UserStats } from '../types/clock';
import { soundEngine } from '../utils/audio';

interface BadgesModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
}

interface BadgeDefinition {
  id: string;
  name: string;
  desc: string;
  icon: string;
  isUnlocked: (stats: UserStats) => boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_step',
    name: '初入森林小鐘錶匠',
    desc: '在時鐘森林答對第 1 道題目',
    icon: '🌱',
    isUnlocked: (s) => s.correctAnswers >= 1,
  },
  {
    id: 'streak_3',
    name: '連擊星火冒險者',
    desc: '連續答對 3 題不間斷',
    icon: '🔥',
    isUnlocked: (s) => s.highestStreak >= 3,
  },
  {
    id: 'streak_5',
    name: '五連擊閃耀星光',
    desc: '連續答對 5 題不間斷',
    icon: '⭐',
    isUnlocked: (s) => s.highestStreak >= 5,
  },
  {
    id: 'master_lv1',
    name: '整點與半點守護者',
    desc: '答對 5 題整點與半點題目',
    icon: '🦉',
    isUnlocked: (s) => (s.levelMastery.lv1_hour_half || 0) >= 5,
  },
  {
    id: 'master_lv2',
    name: '一刻鐘巡邏小精靈',
    desc: '答對 5 題 15 分與 45 分題目',
    icon: '🐰',
    isUnlocked: (s) => (s.levelMastery.lv2_quarter || 0) >= 5,
  },
  {
    id: 'master_lv3',
    name: '五分倍數神速手',
    desc: '熟練掌握 5 的倍數分鐘刻度',
    icon: '🐿️',
    isUnlocked: (s) => (s.levelMastery.lv3_five_min || 0) >= 5,
  },
  {
    id: 'master_lv4',
    name: '精準每分鐘大神探',
    desc: '精準辨識鐘面任意細微刻度',
    icon: '🔍',
    isUnlocked: (s) => (s.levelMastery.lv4_exact_min || 0) >= 5,
  },
  {
    id: 'master_lv5',
    name: '時間計算大魔法師',
    desc: '成功解出經過時間推算難題',
    icon: '⏳',
    isUnlocked: (s) => (s.levelMastery.lv5_elapsed_calc || 0) >= 5,
  },
  {
    id: 'score_200',
    name: '時鐘森林大宗師',
    desc: '累計冒險積分達到 200 分',
    icon: '👑',
    isUnlocked: (s) => s.score >= 200,
  },
];

export const BadgesModal: React.FC<BadgesModalProps> = ({ stats, isOpen, onClose }) => {
  if (!isOpen) return null;

  const unlockedCount = BADGE_DEFINITIONS.filter(b => b.isUnlocked(stats)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-xl w-full shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">森林榮譽勳章館</h3>
              <p className="text-xs text-slate-500">
                已收集 {unlockedCount} / {BADGE_DEFINITIONS.length} 枚勳章
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 overflow-y-auto pr-1">
          {BADGE_DEFINITIONS.map(badge => {
            const unlocked = badge.isUnlocked(stats);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  unlocked
                    ? 'bg-amber-50/70 border-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200/80 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    unlocked ? 'bg-amber-100/90 shadow-inner' : 'bg-slate-200 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{badge.name}</h4>
                    {unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm cursor-pointer"
          >
            繼續冒險
          </button>
        </div>
      </div>
    </div>
  );
};
