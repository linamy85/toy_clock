/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Settings, Volume2, Clock, Check, Sparkles } from 'lucide-react';
import { ClockSettings } from '../types/clock';
import { soundEngine, speakMandarin } from '../utils/audio';

interface SettingsModalProps {
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const timerOptions = [
    { label: '無倒數（輕鬆學）', value: 0 },
    { label: '15 秒（快節奏）', value: 15 },
    { label: '30 秒（推薦挑戰）', value: 30 },
    { label: '45 秒（充裕思考）', value: 45 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg w-full shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">家長與學習輔助設定</h3>
              <p className="text-xs text-slate-500">彈性調整時鐘盤面細節與挑戰倒數</p>
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

        {/* Settings Body */}
        <div className="py-4 space-y-5 overflow-y-auto pr-1">
          {/* 1. Timer Duration Option */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              每題倒數計時挑戰
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timerOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    soundEngine.playPop();
                    onUpdateSettings({ timerDuration: opt.value });
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    settings.timerDuration === opt.value
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt.label}</span>
                  {settings.timerDuration === opt.value && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Clock Face Detail Toggles */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              時鐘視覺輔助細節
            </label>
            <div className="space-y-2">
              {/* Minute Number Labels */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">顯示外圈分鐘數字 (5, 10, 15...)</span>
                  <span className="text-xs text-slate-500">外圈以紅色小數字標示5的倍數分鐘</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showMinuteNumbers}
                  onChange={(e) => {
                    soundEngine.playPop();
                    onUpdateSettings({ showMinuteNumbers: e.target.checked });
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Rainbow Hour Sectors */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">顯示小時彩虹扇形色塊</span>
                  <span className="text-xs text-slate-500">用12色塊教孩子時針的家在哪個數字區間</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showHourZoneColors}
                  onChange={(e) => {
                    soundEngine.playPop();
                    onUpdateSettings({ showHourZoneColors: e.target.checked });
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Color Coded Hands */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">雙色指針區分（時針藍、分針紅）</span>
                  <span className="text-xs text-slate-500">鮮明對比幫助孩子快速分清時針與分針</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.colorCodedHands}
                  onChange={(e) => {
                    soundEngine.playPop();
                    onUpdateSettings({ colorCodedHands: e.target.checked });
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Second Hand */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">顯示動態金黃秒針</span>
                  <span className="text-xs text-slate-500">觀看時鐘指針真實滴答前進</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showSecondHand}
                  onChange={(e) => {
                    soundEngine.playPop();
                    onUpdateSettings({ showSecondHand: e.target.checked });
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Audio & Voice Options */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              音效與語音
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">清脆答對與連擊音效</span>
                  <span className="text-xs text-slate-500">合成清脆水晶音效與勝利旋律</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    soundEngine.setSoundEnabled(enabled);
                    onUpdateSettings({ soundEnabled: enabled });
                    if (enabled) soundEngine.playCorrect();
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Countdown Tick Sound Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800 block">倒數秒針滴答聲 (Tick-Tock)</span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playCountdownTick(2);
                        setTimeout(() => soundEngine.playCountdownTick(1), 220);
                      }}
                      className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                      title="試聽滴答聲"
                    >
                      試聽滴答
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">每秒模擬機械鐘擺高低雙音滴答，最後5秒微幅加速</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.countdownTickSound}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    soundEngine.playPop();
                    onUpdateSettings({ countdownTickSound: checked });
                    if (checked) {
                      soundEngine.playCountdownTick(2);
                    }
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Speech Test */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">測試中文語音發音</span>
                  <span className="text-xs text-slate-500">測試瀏覽器中文時間朗讀音量與清晰度</span>
                </div>
                <button
                  onClick={() => speakMandarin('你好！我是時鐘森林的貓頭鷹博士，現在是下午三點半！')}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  測試朗讀
                </button>
              </div>
            </div>
          </div>
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
            儲存並返回
          </button>
        </div>
      </div>
    </div>
  );
};
