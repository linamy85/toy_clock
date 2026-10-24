/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DifficultyLevel =
  | 'lv1_hour_half'     // 整點與半點 (如 3:00, 3:30)
  | 'lv2_quarter'       // 15分與45分 (如 3:15, 3:45)
  | 'lv3_five_min'      // 5的倍數分鐘 (如 11:40, 3:25)
  | 'lv4_exact_min';    // 精準每分鐘 (如 8:23, 10:47)

export interface ClockTime {
  hour: number;   // 1 to 12
  minute: number; // 0 to 59
  second?: number;
}

export type MascotType = 'owl' | 'squirrel' | 'rabbit' | 'bear';

export interface Question {
  id: string;
  level: DifficultyLevel;
  type: 'identify_time' | 'elapsed_calc';
  time: ClockTime;
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
  showMinuteNumbers: boolean;     // 外圈 05, 10, 15... 55
  showMinuteTicks: boolean;       // 60 個小刻度
  showHourZoneColors: boolean;    // 12 個小時彩虹扇區輔助線
  colorCodedHands: boolean;       // 時針藍色、分針紅色
  showSecondHand: boolean;
  timerDuration: number;          // 0 (無倒數), 15, 30 秒
  countdownTickSound: boolean;    // 倒數滴答聲 (Tick-Tock)
  soundEnabled: boolean;          // 音效開關
}

export interface UserStats {
  score: number;
  correctAnswers: number;
  totalAttempts: number;
  streak: number;
  highestStreak: number;
}
