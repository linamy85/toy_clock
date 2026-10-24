/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, RotateCcw, Clock, ArrowRight, HelpCircle, Flame, Eye, EyeOff, Award } from 'lucide-react';
import { ClockSettings, DifficultyLevel, Question, UserStats } from '../types/clock';
import { ClockCanvas } from './ClockCanvas';
import { MascotAvatar, MASCOT_DETAILS } from './Mascots';
import { generateQuestion } from '../utils/clockMath';
import { soundEngine, speakMandarin, stopSpeaking } from '../utils/audio';

interface QuizViewProps {
  level: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
  stats: UserStats;
  onUpdateStats: (update: (prev: UserStats) => UserStats) => void;
  onOpenBadges: () => void;
}

const LEVEL_NAMES: Record<DifficultyLevel, { name: string; tag: string; desc: string }> = {
  lv1_hour_half: { name: '第 1 關：整點與半點', tag: '基礎入門', desc: '分針停留在 12 與 6' },
  lv2_quarter: { name: '第 2 關：一刻鐘與45分', tag: '掌握刻度', desc: '分針停留在 15 與 45 分' },
  lv3_five_min: { name: '第 3 關：5分鐘大跨步', tag: '五的乘法', desc: '每5分鐘一個大刻度' },
  lv4_exact_min: { name: '第 4 關：精準每分鐘神探', tag: '小學進階', desc: '細看時鐘每一個小小刻度' },
  lv5_elapsed_calc: { name: '第 5 關：經過時間大冒險', tag: '高階挑戰', desc: '計算經過幾分鐘後的終點時間' },
};

export const QuizView: React.FC<QuizViewProps> = ({
  level,
  onLevelChange,
  settings,
  onUpdateSettings,
  stats,
  onUpdateStats,
  onOpenBadges,
}) => {
  const [question, setQuestion] = useState<Question>(() => generateQuestion(level, settings.displayFormat));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [roundQuestionIndex, setRoundQuestionIndex] = useState<number>(1);
  const [showRoundSummary, setShowRoundSummary] = useState<boolean>(false);
  const [roundCorrectCount, setRoundCorrectCount] = useState<number>(0);

  // Timer Countdown state: defaults to active duration (e.g. 30s)
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerDuration > 0 ? settings.timerDuration : 30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize new question
  const loadNextQuestion = useCallback((targetLevel: DifficultyLevel = level) => {
    stopSpeaking();
    setIsSpeaking(false);
    const newQ = generateQuestion(targetLevel, settings.displayFormat);
    setQuestion(newQ);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setWrongAnswers([]);
    setShowExplanation(false);
    setTimeLeft(settings.timerDuration > 0 ? settings.timerDuration : 30);
  }, [level, settings.displayFormat, settings.timerDuration]);

  // When level changes, reload question
  useEffect(() => {
    loadNextQuestion(level);
  }, [level, loadNextQuestion]);

  // Sync timeLeft whenever question ID or timerDuration setting changes
  useEffect(() => {
    if (settings.timerDuration > 0) {
      setTimeLeft(settings.timerDuration);
    }
  }, [question.id, settings.timerDuration]);

  // Active Countdown Timer Effect
  useEffect(() => {
    // If timer is disabled, question already answered, or modal is open, clear interval
    if (settings.timerDuration <= 0 || isAnswered || showRoundSummary) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Play an immediate tick on start/resume if sound is enabled
    if (settings.countdownTickSound !== false) {
      soundEngine.playCountdownTick(timeLeft);
    }

    // Set interval to decrement every 1000ms
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
          setShowExplanation(true);
          return 0;
        }

        const nextTime = prev - 1;
        // Play mechanical clock tick-tock countdown sound
        if (settings.countdownTickSound !== false) {
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
  }, [settings.timerDuration, settings.countdownTickSound, isAnswered, showRoundSummary, question.id]);

  // Quick Cycle Timer Duration: 30s -> 15s -> 45s -> 0 (off) -> 30s
  const handleCycleTimerDuration = () => {
    soundEngine.resumeContext();
    soundEngine.playPop();
    const durations = [30, 15, 45, 0];
    const currentIndex = durations.indexOf(settings.timerDuration);
    const nextDuration = durations[(currentIndex + 1) % durations.length];
    onUpdateSettings({ timerDuration: nextDuration });
    setTimeLeft(nextDuration > 0 ? nextDuration : 30);
  };

  // Toggle Countdown Sound (Tick-Tock vs Mute)
  const handleToggleTickSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.resumeContext();
    soundEngine.playPop();
    const newSoundState = !settings.countdownTickSound;
    onUpdateSettings({ countdownTickSound: newSoundState });
    if (newSoundState) {
      soundEngine.playCountdownTick(timeLeft);
    }
  };

  // Trigger voice reading aloud
  const handleReadAloud = () => {
    soundEngine.resumeContext();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    let speechContent = question.storyPrompt || question.prompt;
    if (isAnswered) {
      if (isCorrect) {
        speechContent = `太棒了，答對囉！${question.explanation.summary}`;
      } else {
        speechContent = `別灰心！${question.explanation.hourExplanation} ${question.explanation.minuteExplanation}`;
      }
    }

    speakMandarin(speechContent, () => {
      setIsSpeaking(false);
    });
  };

  // Handle Answer Selection
  const handleSelectOption = (option: string) => {
    soundEngine.resumeContext();
    if (isAnswered && isCorrect) return; // Already solved correctly

    setSelectedAnswer(option);
    const correct = option === question.correctAnswer;

    if (correct) {
      soundEngine.playCorrect();
      setIsCorrect(true);
      setIsAnswered(true);
      setShowExplanation(true);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#22C55E', '#3B82F6', '#EAB308', '#EC4899'],
      });

      // Update User Stats
      onUpdateStats(prev => {
        const newStreak = prev.streak + 1;
        if (newStreak % 3 === 0) {
          setTimeout(() => soundEngine.playCombo(), 350);
        }
        return {
          ...prev,
          score: prev.score + (10 + Math.min(newStreak * 2, 20)),
          correctAnswers: prev.correctAnswers + 1,
          totalAttempts: prev.totalAttempts + 1,
          streak: newStreak,
          highestStreak: Math.max(prev.highestStreak, newStreak),
          levelMastery: {
            ...prev.levelMastery,
            [level]: (prev.levelMastery[level] || 0) + 1,
          },
        };
      });

      setRoundCorrectCount(c => c + 1);

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

  // Handle Proceed to Next Question in Round
  const handleProceedNext = () => {
    soundEngine.resumeContext();
    soundEngine.playPop();
    if (roundQuestionIndex >= 10) {
      setShowRoundSummary(true);
      soundEngine.playCombo();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      setRoundQuestionIndex(i => i + 1);
      loadNextQuestion();
    }
  };

  // Restart Round
  const handleRestartRound = () => {
    soundEngine.resumeContext();
    soundEngine.playPop();
    setShowRoundSummary(false);
    setRoundQuestionIndex(1);
    setRoundCorrectCount(0);
    loadNextQuestion();
  };

  const mascotMeta = MASCOT_DETAILS[question.mascot];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto w-full px-1 sm:px-4">
      {/* TOP HUD BAR (Responsive 2-Row / Flex Design for Mobile & Tablet) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-sm border border-emerald-100/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* ROW 1: Level Picker & Round Progress & Streak */}
        <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
          {/* Level Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={level}
              onChange={(e) => {
                soundEngine.resumeContext();
                const newLv = e.target.value as DifficultyLevel;
                onLevelChange(newLv);
                soundEngine.playPop();
              }}
              aria-label="選擇關卡難度"
              className="bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {Object.entries(LEVEL_NAMES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Progress */}
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <span className="font-mono text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-lg">
              第 {roundQuestionIndex}/10 題
            </span>
          </div>

          {/* Streak indicator */}
          {stats.streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-2 py-1 rounded-lg animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{stats.streak} 連對</span>
            </div>
          )}
        </div>

        {/* ROW 2: Timer Countdown Control & Speech & Detail Helpers */}
        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          {/* Active Countdown Timer Button */}
          {settings.timerDuration > 0 ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
              }`}
            >
              <button
                onClick={handleCycleTimerDuration}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                title="點擊切換倒數時間 (30s / 15s / 45s / 關閉)"
              >
                <Clock
                  className={`w-4 h-4 text-sky-600 transition-transform duration-200 ${
                    timeLeft % 2 === 0 ? '-rotate-12' : 'rotate-12'
                  }`}
                />
                <span className="font-mono text-sm font-extrabold">{timeLeft}s</span>
              </button>

              {/* Sound Toggle Icon */}
              <button
                onClick={handleToggleTickSound}
                className="ml-1 px-1.5 py-0.5 rounded-md bg-white/70 hover:bg-white text-[11px] font-semibold text-sky-700 cursor-pointer transition-colors"
                title={settings.countdownTickSound ? '點擊靜音滴答聲' : '點擊開啟滴答聲'}
              >
                {settings.countdownTickSound ? '🔊 滴答' : '🔇 靜音'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCycleTimerDuration}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="點擊開啟倒數計時"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>開啟倒數</span>
            </button>
          )}

          {/* TTS Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="點擊語音朗讀題目與時間"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? '朗讀中' : '聽題目'}</span>
          </button>

          {/* Minute Number Label Toggle */}
          <button
            onClick={() => {
              soundEngine.resumeContext();
              soundEngine.playPop();
              onUpdateSettings({ showMinuteNumbers: !settings.showMinuteNumbers });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
              settings.showMinuteNumbers
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="開關外圈 5, 10, 15 分鐘數字輔助"
          >
            {settings.showMinuteNumbers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">分鐘刻度</span>
          </button>

          {/* Rainbow Hour Zone Toggle */}
          <button
            onClick={() => {
              soundEngine.resumeContext();
              soundEngine.playPop();
              onUpdateSettings({ showHourZoneColors: !settings.showHourZoneColors });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
              settings.showHourZoneColors
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="開關12小時彩虹扇區"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">小時色塊</span>
          </button>
        </div>
      </div>

      {/* MAIN QUIZ STAGE (Responsive 2-Zone Layout: Stacked on Mobile, Side-by-Side on Desktop/Tablet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* LEFT ZONE: Clock Canvas (7 cols on Desktop, full width on Mobile/Tablet) */}
        <div className="lg:col-span-7 bg-white/95 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-emerald-100/80 flex flex-col items-center justify-between">
          {/* Question Prompt Header */}
          <div className="w-full text-center mb-1 sm:mb-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {LEVEL_NAMES[level].tag}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mt-1 sm:mt-2">
              {question.type === 'elapsed_calc' ? question.prompt : '現在時鐘指著幾點幾分？'}
            </h2>
          </div>

          {/* Responsive SVG Clock Dial */}
          <div className="my-2 sm:my-auto w-full flex items-center justify-center">
            <ClockCanvas
              time={question.time}
              settings={settings}
              size={320}
              highlightElapsedMinutes={question.type === 'elapsed_calc' ? question.elapsedMinutes : undefined}
            />
          </div>

          {/* Dial Legend & Visual Hints */}
          <div className="w-full flex items-center justify-center gap-3 sm:gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span className="font-medium text-slate-700">藍色短針：時針</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <span className="font-medium text-slate-700">紅色長針：分針</span>
            </div>
            {question.type === 'elapsed_calc' && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="font-medium text-emerald-700">綠色弧線：經過的時間</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: Mascot Speech & Answer Options Deck (5 cols on Desktop, full width on Mobile/Tablet) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
          {/* Story Prompt Mascot Speech Card */}
          <div className="bg-amber-50/90 rounded-2xl p-3 sm:p-4 border border-amber-200/80 shadow-xs flex items-center sm:items-start gap-3">
            <MascotAvatar
              type={question.mascot}
              mood={isCorrect ? 'celebrating' : wrongAnswers.length > 0 ? 'encouraging' : 'idle'}
              size={48}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">{mascotMeta.name}</span>
                <button
                  onClick={handleReadAloud}
                  className="text-amber-700 hover:text-amber-900 transition-colors p-1"
                  title="點我聽朗讀"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm font-medium text-amber-950 mt-0.5 leading-snug">
                {isCorrect
                  ? mascotMeta.cheer
                  : wrongAnswers.length > 0
                  ? '沒關係，仔細看看時針在誰的家？再猜一次！'
                  : question.storyPrompt || '仔細看時鐘的指針，選出正確的答案吧！'}
              </p>
            </div>
          </div>

          {/* 4 Interactive Answer Option Cards (Responsive Touch-Friendly Grid) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 flex-1 items-stretch">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isWrong = wrongAnswers.includes(option);
              const isOptionCorrect = isAnswered && option === question.correctAnswer;

              let btnStyle = 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-800 shadow-xs';
              if (isOptionCorrect) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-extrabold shadow-md scale-102 ring-2 ring-emerald-300';
              } else if (isWrong) {
                btnStyle = 'bg-rose-50 border-rose-200 text-rose-400 line-through opacity-60 cursor-not-allowed';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-amber-100 border-amber-300 text-amber-900';
              }

              return (
                <button
                  key={`opt-${idx}-${option}`}
                  onClick={() => !isWrong && handleSelectOption(option)}
                  disabled={isWrong || (isAnswered && isCorrect)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 min-h-[58px] sm:min-h-[72px] rounded-2xl border-2 font-bold text-base sm:text-xl transition-all active:scale-96 cursor-pointer ${btnStyle}`}
                >
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                    選項 {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="font-mono tracking-tight">{option}</span>
                </button>
              );
            })}
          </div>

          {/* FEEDBACK & STEP-BY-STEP EXPLANATION */}
          {showExplanation && (
            <div
              className={`rounded-2xl p-3.5 sm:p-4 border transition-all ${
                isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 font-bold text-xs sm:text-sm">
                <HelpCircle className={`w-4 h-4 ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span className={isCorrect ? 'text-emerald-900' : 'text-amber-900'}>
                  {isCorrect ? '太厲害了！解題秘笈：' : '時間小撇步：'}
                </span>
              </div>
              <ul className="text-xs space-y-1 text-slate-700 leading-relaxed font-medium">
                <li>• {question.explanation.hourExplanation}</li>
                <li>• {question.explanation.minuteExplanation}</li>
                <li className="font-bold text-emerald-800 pt-0.5">★ {question.explanation.summary}</li>
              </ul>

              {/* Action Button: Next Question */}
              <button
                onClick={handleProceedNext}
                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[44px]"
              >
                <span>下一題</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Retry hint when user selected wrong but not yet solved */}
          {!showExplanation && wrongAnswers.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-2.5 rounded-xl flex items-center justify-between">
              <span>答案不太對喔！再看一眼時針走到哪裡了？</span>
              <button
                onClick={() => soundEngine.playPop()}
                className="text-rose-600 underline font-bold hover:text-rose-900 ml-2"
              >
                重新看指針
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 10-QUESTION ROUND SUMMARY MODAL */}
      {showRoundSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <MascotAvatar type="owl" mood="celebrating" size={80} className="mb-2" />
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">🎉 關卡挑戰完成！</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              你在【{LEVEL_NAMES[level].name}】完成了 10 題冒險！
            </p>

            {/* Score Stats Card */}
            <div className="grid grid-cols-2 gap-3 w-full my-4">
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                <span className="text-xs text-slate-500 font-semibold">答對題數</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
                  {roundCorrectCount} / 10
                </p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                <span className="text-xs text-slate-500 font-semibold">獲得積分</span>
                <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono mt-0.5">
                  +{roundCorrectCount * 15}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex gap-2 mb-5">
              {[1, 2, 3].map((star) => {
                const filled = roundCorrectCount >= star * 3;
                return (
                  <Sparkles
                    key={star}
                    className={`w-7 h-7 ${filled ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-200'}`}
                  />
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                onClick={handleRestartRound}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再玩一次</span>
              </button>
              {level !== 'lv5_elapsed_calc' && (
                <button
                  onClick={() => {
                    const levels: DifficultyLevel[] = ['lv1_hour_half', 'lv2_quarter', 'lv3_five_min', 'lv4_exact_min', 'lv5_elapsed_calc'];
                    const currentIdx = levels.indexOf(level);
                    const nextLv = levels[currentIdx + 1];
                    onLevelChange(nextLv);
                    handleRestartRound();
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Award className="w-4 h-4" />
                  <span>前進下一關</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
