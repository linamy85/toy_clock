/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DifficultyLevel =
  | 'lv1_hour_half'     // 整點與半點 (如 3:00, 3:30)
  | 'lv2_quarter'       // 一刻鐘與45分 (如 3:15, 3:45)
  | 'lv3_five_min'      // 5的倍數分鐘 (如 3:05, 3:20, 3:55)
  | 'lv4_exact_min'     // 精準到每一分鐘 (如 3:17, 3:42)
  | 'lv5_elapsed_calc'; // 小學進階：經過時間推算 (如 2:15 經過 35 分鐘)

export type GameMode = 'adventure' | 'free_practice' | 'elapsed_challenge';

export interface ClockTime {
  hour: number;   // 1 to 12
  minute: number; // 0 to 59
  second?: number;
}

export type MascotType = 'owl' | 'squirrel' | 'rabbit' | 'bear';

export interface MascotInfo {
  id: MascotType;
  name: string;
  title: string;
  avatarBg: string;
}

export interface Question {
  id: string;
  level: DifficultyLevel;
  type: 'identify_time' | 'elapsed_calc';
  time: ClockTime;
  endTime?: ClockTime; // for elapsed time question
  elapsedMinutes?: number;
  options: string[];
  correctAnswer: string;
  prompt: string;
  storyPrompt?: string;
  explanation: {
    hourExplanation: string;
    minuteExplanation: string;
    summary: string;
  };
  mascot: MascotType;
}

export interface ClockSettings {
  showMinuteNumbers: boolean;     // 外圈 00, 05, 10... 55
  showMinuteTicks: boolean;       // 60 個小刻度
  showHourZoneColors: boolean;    // 12 個小時彩虹扇區輔助線
  colorCodedHands: boolean;       // 時針藍色、分針紅色
  showSecondHand: boolean;
  timerDuration: number;          // 0 (無倒數), 15, 30, 45 秒
  countdownTickSound: boolean;    // 倒數時發出秒針滴答聲 (Tick-Tock)
  soundEnabled: boolean;
  displayFormat: 'chinese' | 'digital'; // '3點15分' 或 '03:15'
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  score: number;
  correctAnswers: number;
  totalAttempts: number;
  streak: number;
  highestStreak: number;
  levelMastery: Record<DifficultyLevel, number>; // correct count
}
