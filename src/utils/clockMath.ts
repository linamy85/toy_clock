/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClockTime, DifficultyLevel, MascotType, Question } from '../types/clock';

// Calculate exact angle for hour hand in degrees (0 = 12 o'clock, 90 = 3 o'clock, etc.)
export function getHourHandAngle(hour: number, minute: number, second: number = 0): number {
  const normalizedHour = hour % 12;
  return (normalizedHour * 30) + (minute / 60) * 30 + (second / 3600) * 0.5;
}

// Calculate exact angle for minute hand in degrees
export function getMinuteHandAngle(minute: number, second: number = 0): number {
  return (minute * 6) + (second / 60) * 0.1;
}

// Calculate exact angle for second hand in degrees
export function getSecondHandAngle(second: number): number {
  return (second % 60) * 6;
}

// Format time in clean digital format like 11:40, 3:05, 12:30 (No Chinese words)
export function formatTimeDigital(hour: number, minute: number): string {
  const displayHour = hour === 0 ? 12 : hour;
  const mStr = minute.toString().padStart(2, '0');
  return `${displayHour}:${mStr}`;
}

export function formatTime(time: ClockTime): string {
  return formatTimeDigital(time.hour, time.minute);
}

// Add minutes to a ClockTime, wrapping correctly through 1..12
export function addMinutesToTime(time: ClockTime, minutesToAdd: number): ClockTime {
  const totalMinutes = (time.hour % 12) * 60 + time.minute + minutesToAdd;
  const wrappedMinutes = ((totalMinutes % 720) + 720) % 720;
  let newHour = Math.floor(wrappedMinutes / 60);
  if (newHour === 0) newHour = 12;
  const newMinute = wrappedMinutes % 60;
  return { hour: newHour, minute: newMinute };
}

// Generate smart distractor times based on typical kid misconceptions
function generateDistractorTimes(targetTime: ClockTime, level: DifficultyLevel): ClockTime[] {
  const distractors: ClockTime[] = [];
  const { hour, minute } = targetTime;

  // 1. Advance Hour Error: when minute is >= 35, kids often read the next hour
  if (minute >= 35) {
    const nextHour = (hour % 12) + 1;
    distractors.push({ hour: nextHour, minute });
  } else if (minute <= 20) {
    const prevHour = hour === 1 ? 12 : hour - 1;
    distractors.push({ hour: prevHour, minute });
  }

  // 2. Reading minute hand literally as hour number (e.g. 8 is read as 8 min instead of 40 min)
  if (minute >= 5 && minute % 5 === 0) {
    const dialNum = minute / 5;
    distractors.push({ hour, minute: dialNum });
  }

  // 3. Reversed hands (reading hour hand as minute, minute hand as hour)
  const approxHourFromMin = Math.max(1, Math.min(12, Math.round(minute / 5) || 12));
  const approxMinFromHour = (hour % 12) * 5;
  if (approxHourFromMin !== hour || approxMinFromHour !== minute) {
    distractors.push({ hour: approxHourFromMin, minute: approxMinFromHour });
  }

  // 4. Minute shifts
  const shifts = level === 'lv4_exact_min' 
    ? [1, -1, 2, -2, 5, -5] 
    : [5, -5, 10, -10, 15, -15, 30];

  for (const shift of shifts) {
    const newMin = (minute + shift + 60) % 60;
    distractors.push({ hour, minute: newMin });
    if (distractors.length >= 8) break;
  }

  // 5. Hour shifts
  distractors.push({ hour: (hour % 12) + 1, minute });
  distractors.push({ hour: hour === 1 ? 12 : hour - 1, minute });

  // Deduplicate and pick 3 unique distractors
  const uniqueDistractors: ClockTime[] = [];
  const seen = new Set<string>();
  seen.add(`${hour}:${minute}`);

  const shuffled = distractors.sort(() => Math.random() - 0.5);

  for (const d of shuffled) {
    const key = `${d.hour}:${d.minute}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length === 3) break;
  }

  // Fallback if needed
  let safetyH = (hour % 12) + 1;
  let safetyM = (minute + 15) % 60;
  while (uniqueDistractors.length < 3) {
    const key = `${safetyH}:${safetyM}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDistractors.push({ hour: safetyH, minute: safetyM });
    }
    safetyH = (safetyH % 12) + 1;
    safetyM = (safetyM + 10) % 60;
  }

  return uniqueDistractors;
}

const MASCOTS: MascotType[] = ['owl', 'squirrel', 'rabbit', 'bear'];

export function generateQuestion(level: DifficultyLevel): Question {
  let hour = Math.floor(Math.random() * 12) + 1;
  let minute = 0;

  switch (level) {
    case 'lv1_hour_half':
      // Level 1: :00 或 :30
      minute = Math.random() > 0.5 ? 0 : 30;
      break;

    case 'lv2_quarter': {
      // Level 2: :15 或 :45
      const optionsQuarter = [15, 45, 15, 45, 0, 30];
      minute = optionsQuarter[Math.floor(Math.random() * optionsQuarter.length)];
      break;
    }

    case 'lv3_five_min': {
      // Level 3: 5的倍數 (如 :05, :10, :20, :40)
      const fiveMins = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55];
      minute = fiveMins[Math.floor(Math.random() * fiveMins.length)];
      break;
    }

    case 'lv4_exact_min': {
      // Level 4: 任意分鐘
      minute = Math.floor(Math.random() * 60);
      break;
    }

  }

  const targetTime: ClockTime = { hour, minute };
  const mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];

  // Standard Question (Levels 1 to 4)
  const distractors = generateDistractorTimes(targetTime, level);
  const correctAnsStr = formatTime(targetTime);
  const allOptions = [
    correctAnsStr,
    ...distractors.map(d => formatTime(d)),
  ].sort(() => Math.random() - 0.5);

  const mStr = minute.toString().padStart(2, '0');
  let hourHint = `時針指在 ${hour}`;
  if (minute >= 35) {
    hourHint = `時針接近 ${(hour % 12) + 1}，但還在 ${hour}`;
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    level,
    type: 'identify_time',
    time: targetTime,
    options: allOptions,
    correctAnswer: correctAnsStr,
    prompt: `現在是幾點？`,
    storyPrompt: `看時鐘，選出正確的時間！`,
    explanation: {
      hourExplanation: `${hourHint}`,
      minuteExplanation: `分針指在 ${mStr} 分`,
      summary: `時間是 ${correctAnsStr}`,
    },
    mascot,
  };
}
