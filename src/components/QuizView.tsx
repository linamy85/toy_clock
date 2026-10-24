/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Clock, ArrowRight, RotateCcw, Volume2, VolumeX, Flame } from 'lucide-react';
import { ClockSettings, DifficultyLevel, Question, UserStats } from '../types/clock';
import { ClockCanvas } from './ClockCanvas';
import { MascotAvatar, MASCOT_DETAILS } from './Mascots';
import { generateQuestion } from '../utils/clockMath';
import { soundEngine } from '../utils/audio';

interface QuizViewProps {
  level: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
  stats: UserStats;
  onUpdateStats: (update: (prev: UserStats) => UserStats) => void;
}

const LEVEL_LIST: { id: DifficultyLevel; name: string; example: string }[] = [
  { id: 'lv1_hour_half', name: '入門', example: ':00 / :30' },
  { id: 'lv2_quarter', name: '一刻', example: ':15 / :45' },
  { id: 'lv3_five_min', name: '進階', example: '11:40' },
  { id: 'lv4_exact_min', name: '挑戰', example: '每分鐘' },
];

export const QuizView: React.FC<QuizViewProps> = ({
  level,
  onLevelChange,
  settings,
  onUpdateSettings,
  stats,
  onUpdateStats,
}) => {
  const [question, setQuestion] = useState<Question>(() => generateQuestion(level));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [roundIndex, setRoundIndex] = useState<number>(1);
  const [showRoundComplete, setShowRoundComplete] = useState<boolean>(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerDuration > 0 ? settings.timerDuration : 30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load next question
  const loadNextQuestion = useCallback((targetLevel: DifficultyLevel = level) => {
    const newQ = generateQuestion(targetLevel);
    setQuestion(newQ);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setWrongAnswers([]);
    setTimeLeft(settings.timerDuration > 0 ? settings.timerDuration : 30);
  }, [level, settings.timerDuration]);

  // Handle level change
  useEffect(() => {
    loadNextQuestion(level);
  }, [level, loadNextQuestion]);

  // Sync timeLeft when question or timer settings change
  useEffect(() => {
    if (settings.timerDuration > 0) {
      setTimeLeft(settings.timerDuration);
    }
  }, [question.id, settings.timerDuration]);

  // Countdown Interval
  useEffect(() => {
    if (settings.timerDuration <= 0 || isAnswered || showRoundComplete) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Play tick on start
    if (settings.countdownTickSound && settings.soundEnabled) {
      soundEngine.playCountdownTick(timeLeft);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          soundEngine.playTimeUp();
          setIsAnswered(true);
          setIsCorrect(false);
          return 0;
        }

        const nextTime = prev - 1;
        if (settings.countdownTickSound && settings.soundEnabled) {
          soundEngine.playCountdownTick(nextTime);
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [settings.timerDuration, settings.countdownTickSound, settings.soundEnabled, isAnswered, showRoundComplete, question.id]);

  // Cycle timer duration
  const handleCycleTimer = () => {
    soundEngine.resumeContext();
    soundEngine.playPop();
    const durations = [30, 15, 0];
    const curIdx = durations.indexOf(settings.timerDuration);
    const nextDuration = durations[(curIdx + 1) % durations.length];
    onUpdateSettings({ timerDuration: nextDuration });
    setTimeLeft(nextDuration > 0 ? nextDuration : 30);
  };

  // Toggle sound
  const handleToggleSound = () => {
    soundEngine.resumeContext();
    const nextSound = !settings.soundEnabled;
    soundEngine.setSoundEnabled(nextSound);
    onUpdateSettings({ soundEnabled: nextSound });
    if (nextSound) soundEngine.playPop();
  };

  // Answer selection
  const handleSelect = (option: string) => {
    soundEngine.resumeContext();
    if (isAnswered && isCorrect) return;

    setSelectedAnswer(option);
    const correct = option === question.correctAnswer;

    if (correct) {
      soundEngine.playCorrect();
      setIsCorrect(true);
      setIsAnswered(true);

      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#22C55E', '#3B82F6', '#EAB308', '#EC4899'],
      });

      onUpdateStats(prev => {
        const newStreak = prev.streak + 1;
        if (newStreak % 3 === 0) {
          setTimeout(() => soundEngine.playCombo(), 300);
        }
        return {
          ...prev,
          score: prev.score + (10 + Math.min(newStreak * 2, 20)),
          correctAnswers: prev.correctAnswers + 1,
          totalAttempts: prev.totalAttempts + 1,
          streak: newStreak,
          highestStreak: Math.max(prev.highestStreak, newStreak),
        };
      });
    } else {
      soundEngine.playWrong();
      setWrongAnswers(prev => [...prev, option]);
      onUpdateStats(prev => ({
        ...prev,
        streak: 0,
        totalAttempts: prev.totalAttempts + 1,
      }));
    }
  };

  // Proceed next
  const handleNext = () => {
    soundEngine.resumeContext();
    soundEngine.playPop();
    if (roundIndex >= 10) {
      setShowRoundComplete(true);
      soundEngine.playCombo();
    } else {
      setRoundIndex(r => r + 1);
      loadNextQuestion();
    }
  };

  // Restart
  const handleRestart = () => {
    soundEngine.resumeContext();
    soundEngine.playPop();
    setShowRoundComplete(false);
    setRoundIndex(1);
    loadNextQuestion();
  };

  const mascotMeta = MASCOT_DETAILS[question.mascot];

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 max-w-2xl mx-auto w-full px-2 sm:px-4">
      {/* CLEAN TOP CONTROL BAR */}
      <div className="w-full bg-white/95 rounded-2xl p-2.5 sm:p-3.5 shadow-sm border border-emerald-100 flex items-center justify-between gap-2">
        {/* Simple Level Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
          {LEVEL_LIST.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => {
                soundEngine.resumeContext();
                soundEngine.playPop();
                onLevelChange(lvl.id);
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                level === lvl.id
                  ? 'bg-emerald-600 text-white shadow-xs scale-102'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{lvl.name}</span>
              <span className="hidden sm:inline text-[11px] opacity-80 ml-1">({lvl.example})</span>
            </button>
          ))}
        </div>

        {/* Right Stats: Timer, Sound, Stars */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Countdown Timer Button */}
          <button
            onClick={handleCycleTimer}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
              settings.timerDuration > 0
                ? timeLeft <= 5
                  ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title="點擊切換倒數時間"
          >
            <Clock
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                settings.timerDuration > 0 && timeLeft % 2 === 0 ? '-rotate-12' : 'rotate-12'
              }`}
            />
            <span className="font-mono">
              {settings.timerDuration > 0 ? `${timeLeft}s` : '無倒數'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label="開關音效"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
            title={settings.soundEnabled ? '音效開啟' : '音效靜音'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Stars Count */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-mono">{stats.score}</span>
          </div>
        </div>
      </div>

      {/* CLOCK STAGE */}
      <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-emerald-100 flex flex-col items-center">
        {/* Progress & Question Title */}
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
            第 {roundIndex}/10 題
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
            現在是幾點？
          </h2>
          {stats.streak > 1 ? (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {stats.streak} 連對
            </span>
          ) : <div className="w-12" />}
        </div>

        {/* Big Scalable SVG Clock */}
        <div className="my-2 sm:my-3 w-full flex items-center justify-center">
          <ClockCanvas
            time={question.time}
            settings={settings}
            size={310}
          />
        </div>

        {/* Simple Hand Color Cue */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>藍色：時針</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>紅色：分針</span>
          </div>
        </div>
      </div>

      {/* 4 BIG DIGIT ANSWER CARDS (e.g. 11:40) */}
      <div className="w-full grid grid-cols-2 gap-3 sm:gap-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isWrong = wrongAnswers.includes(opt);
          const isOptCorrect = isAnswered && opt === question.correctAnswer;

          // Color accents for each of the 4 cards for kid appeal
          const bgColors = [
            'hover:border-sky-300 hover:bg-sky-50/50',
            'hover:border-amber-300 hover:bg-amber-50/50',
            'hover:border-emerald-300 hover:bg-emerald-50/50',
            'hover:border-rose-300 hover:bg-rose-50/50',
          ];

          let btnClass = `bg-white border-2 border-slate-200 text-slate-800 shadow-sm ${bgColors[idx % 4]}`;
          if (isOptCorrect) {
            btnClass = 'bg-emerald-500 border-2 border-emerald-600 text-white font-black shadow-md scale-102 ring-4 ring-emerald-200';
          } else if (isWrong) {
            btnClass = 'bg-slate-100 border-2 border-slate-200 text-slate-300 opacity-50 line-through cursor-not-allowed';
          } else if (isSelected && !isCorrect) {
            btnClass = 'bg-rose-50 border-2 border-rose-300 text-rose-800';
          }

          return (
            <button
              key={`opt-${idx}-${opt}`}
              onClick={() => !isWrong && handleSelect(opt)}
              disabled={isWrong || (isAnswered && isCorrect)}
              className={`py-4 sm:py-5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer min-h-[70px] sm:min-h-[82px] ${btnClass}`}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-black font-mono tracking-tight">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* CUTE ANIMAL MASCOT ENCOURAGEMENT / NEXT BUTTON */}
      <div className="w-full">
        {isAnswered && isCorrect ? (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <MascotAvatar type={question.mascot} mood="celebrating" size={48} className="shrink-0" />
              <div>
                <span className="text-base sm:text-lg font-black text-emerald-800 block">
                  🎉 答對了！太厲害了！
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                  正確時間正是：<strong className="font-mono text-base">{question.correctAnswer}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl shadow-md transition-all flex items-center gap-1.5 text-sm sm:text-base cursor-pointer shrink-0 active:scale-95"
            >
              <span>下一題</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : wrongAnswers.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
            <MascotAvatar type={question.mascot} mood="encouraging" size={40} className="shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              沒關係，再看一眼時針在哪裡？再猜猜看！
            </span>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-2.5 sm:p-3 border border-emerald-100 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 text-center">
            <MascotAvatar type={question.mascot} mood="idle" size={32} />
            <span>看清楚指針，點選下方的時間卡片喔！</span>
          </div>
        )}
      </div>

      {/* ROUND FINISH MODAL */}
      {showRoundComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-emerald-100 flex flex-col items-center text-center">
            <MascotAvatar type="owl" mood="celebrating" size={80} className="mb-2" />
            <h3 className="text-2xl font-black text-slate-800">🎉 關卡完成！</h3>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              太棒了！你完成了 10 題時間大冒險！
            </p>

            <div className="my-5 bg-amber-50 rounded-2xl p-3.5 border border-amber-200 w-full">
              <span className="text-xs text-amber-700 font-bold">總星星得分</span>
              <p className="text-3xl font-black text-amber-800 font-mono mt-0.5">
                ⭐ {stats.score}
              </p>
            </div>

            <button
              onClick={handleRestart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              <RotateCcw className="w-5 h-5" />
              <span>再玩一輪</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
