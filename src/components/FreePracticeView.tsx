/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, Sparkles, Shuffle, Plus, Minus, BookOpen, Eye, EyeOff } from 'lucide-react';
import { ClockSettings, ClockTime } from '../types/clock';
import { ClockCanvas } from './ClockCanvas';
import { formatTimeChinese, formatTimeDigital } from '../utils/clockMath';
import { soundEngine, speakMandarin, stopSpeaking } from '../utils/audio';
import { MascotAvatar } from './Mascots';

interface FreePracticeViewProps {
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
}

export const FreePracticeView: React.FC<FreePracticeViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [time, setTime] = useState<ClockTime>({ hour: 3, minute: 15, second: 0 });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showDigitalTime, setShowDigitalTime] = useState<boolean>(true);

  // Quick adjust time
  const adjustMinutes = (deltaMinutes: number) => {
    soundEngine.playTick();
    setTime(prev => {
      const totalMinutes = (prev.hour % 12) * 60 + prev.minute + deltaMinutes;
      const wrapped = ((totalMinutes % 720) + 720) % 720;
      let newHour = Math.floor(wrapped / 60);
      if (newHour === 0) newHour = 12;
      const newMinute = wrapped % 60;
      return { hour: newHour, minute: newMinute, second: 0 };
    });
  };

  // Pick random time
  const handleRandomTime = () => {
    soundEngine.playPop();
    const randomHour = Math.floor(Math.random() * 12) + 1;
    const randomMinute = Math.floor(Math.random() * 60);
    setTime({ hour: randomHour, minute: randomMinute, second: 0 });
  };

  // Read time aloud
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    soundEngine.playPop();
    setIsSpeaking(true);
    const spokenText = `現在是 ${formatTimeChinese(time.hour, time.minute)}`;
    speakMandarin(spokenText, () => setIsSpeaking(false));
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* HEADER BANNER */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>🎨 自由撥鐘探索工坊</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            用滑鼠或手指直接拖曳指針，觀察時針與分針的連動關係，並點擊朗讀聆聽發音！
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDigitalTime(!showDigitalTime)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              showDigitalTime ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {showDigitalTime ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showDigitalTime ? '隱藏電子鐘' : '顯示電子鐘'}</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ showMinuteNumbers: !settings.showMinuteNumbers })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              settings.showMinuteNumbers ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>外圈分鐘刻度</span>
          </button>
        </div>
      </div>

      {/* 2-ZONE MAIN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: Clock Stage (7 cols on Desktop, full width on Mobile/Tablet) */}
        <div className="lg:col-span-7 bg-white/95 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-emerald-100 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              可滑動指針撥鐘
            </span>
            <button
              onClick={handleRandomTime}
              className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>隨機出題</span>
            </button>
          </div>

          {/* Scalable SVG Clock with Drag & Touch Support */}
          <div className="my-3 w-full flex items-center justify-center">
            <ClockCanvas
              time={time}
              settings={settings}
              interactive={true}
              onTimeChange={setTime}
              size={320}
            />
          </div>

          {/* Quick Step Adjustment Buttons (Touch friendly) */}
          <div className="w-full pt-3 sm:pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => adjustMinutes(-15)}
              className="flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Minus className="w-3 h-3" /> 15分
            </button>
            <button
              onClick={() => adjustMinutes(-5)}
              className="flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Minus className="w-3 h-3" /> 5分
            </button>
            <button
              onClick={() => adjustMinutes(-1)}
              className="flex items-center gap-0.5 px-2 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Minus className="w-3 h-3" /> 1分
            </button>
            <button
              onClick={() => adjustMinutes(1)}
              className="flex items-center gap-0.5 px-2 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3 h-3" /> 1分
            </button>
            <button
              onClick={() => adjustMinutes(5)}
              className="flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3 h-3" /> 5分
            </button>
            <button
              onClick={() => adjustMinutes(15)}
              className="flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3 h-3" /> 15分
            </button>
            <button
              onClick={() => adjustMinutes(60)}
              className="flex items-center gap-0.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3 h-3" /> 1小時
            </button>
          </div>
        </div>

        {/* RIGHT: Time Reading Deck & Knowledge Station (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Current Time Display & TTS Card */}
          <div className="bg-white/95 rounded-3xl p-6 shadow-md border border-emerald-100 flex flex-col items-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              目前時鐘所指時間
            </span>

            {showDigitalTime ? (
              <div className="my-3">
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-800">
                  {formatTimeDigital(time.hour, time.minute)}
                </div>
                <div className="text-lg font-bold text-emerald-700 mt-1">
                  {formatTimeChinese(time.hour, time.minute)}
                </div>
              </div>
            ) : (
              <div className="my-6 text-slate-400 font-semibold text-sm">
                （電子鐘已隱藏，看鐘面猜猜看！）
              </div>
            )}

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              className={`w-full py-3 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-base">{isSpeaking ? '朗讀中...' : '🔊 點我朗讀發音'}</span>
            </button>

            {/* Time breakdown explanation */}
            <div className="w-full mt-4 p-3 bg-emerald-50/70 rounded-xl text-left text-xs space-y-1.5 text-slate-700 border border-emerald-100">
              <p>
                <strong className="text-blue-700">藍色短針（時針）：</strong>指在 {time.hour} 點附近
              </p>
              <p>
                <strong className="text-rose-700">紅色長針（分針）：</strong>走到了 {time.minute} 分
                {time.minute % 5 === 0 && time.minute > 0 ? `（對應數字 ${time.minute / 5} × 5）` : ''}
              </p>
            </div>
          </div>

          {/* Clock Secrets / Learning Wisdom Card */}
          <div className="bg-amber-50/80 rounded-3xl p-5 shadow-sm border border-amber-200/80 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <h4 className="text-sm font-bold text-amber-950">時鐘小百科秘密</h4>
            </div>

            <div className="text-xs space-y-2 text-amber-900 leading-relaxed font-medium">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-800">1. 時針為什麼會慢慢移動？</span>
                <p className="mt-0.5 text-slate-600">
                  當分針轉一整圈（60分鐘），時針剛好走完一個大數字（30度）。分針走到半圈（30分），時針就走到兩個數字的中間喔！
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-800">2. 五的乘法小口訣：</span>
                <p className="mt-0.5 text-slate-600">
                  分針指在 1 是 5分，指在 2 是 10分，指在 6 是 30分（六五三十），指在 9 是 45分（九五四十五）！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
