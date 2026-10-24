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

// Format time in natural Mandarin
export function formatTimeChinese(hour: number, minute: number): string {
  const displayHour = hour === 0 ? 12 : hour;
  if (minute === 0) {
    return `${displayHour}點整`;
  }
  if (minute === 30) {
    return `${displayHour}點半`;
  }
  if (minute < 10) {
    return `${displayHour}點零${minute}分`;
  }
  return `${displayHour}點${minute}分`;
}

// Format time in standard digital format (HH:MM)
export function formatTimeDigital(hour: number, minute: number): string {
  const hStr = hour.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

export function formatTime(time: ClockTime, format: 'chinese' | 'digital'): string {
  return format === 'chinese' 
    ? formatTimeChinese(time.hour, time.minute) 
    : formatTimeDigital(time.hour, time.minute);
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

// Generate smart distractor options based on typical kid misconceptions
function generateDistractorTimes(targetTime: ClockTime, level: DifficultyLevel): ClockTime[] {
  const distractors: ClockTime[] = [];
  const { hour, minute } = targetTime;

  // 1. Advance Hour Error: when minute is >= 40, kids often think hour is already the next hour
  if (minute >= 35) {
    const nextHour = (hour % 12) + 1;
    distractors.push({ hour: nextHour, minute });
  } else if (minute <= 20) {
    // Or previous hour
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

  // 4. Minute shifts (+5, -5, +10, -10, +15, -15, or +/- 1 for exact level)
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

  // Shuffle and deduplicate
  const uniqueDistractors: ClockTime[] = [];
  const seen = new Set<string>();
  seen.add(`${hour}:${minute}`);

  // Shuffle candidate pool
  const shuffled = distractors.sort(() => Math.random() - 0.5);

  for (const d of shuffled) {
    const key = `${d.hour}:${d.minute}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length === 3) break;
  }

  // Fallback if needed to guarantee 3 distractors
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

const STORY_TEMPLATES = [
  { mascot: 'owl' as MascotType, action: '貓頭鷹博士在樹屋圖書館研讀天文星圖' },
  { mascot: 'squirrel' as MascotType, action: '小松鼠奇奇在橡樹下烘焙美味榛果派' },
  { mascot: 'rabbit' as MascotType, action: '兔子波波正在準備森林慶典的茶會點心' },
  { mascot: 'bear' as MascotType, action: '熊熊老師在森林學校召集小動物集合' },
];

export function generateQuestion(level: DifficultyLevel, format: 'chinese' | 'digital'): Question {
  let hour = Math.floor(Math.random() * 12) + 1;
  let minute = 0;

  switch (level) {
    case 'lv1_hour_half':
      // Level 1: 整點 或 半點
      minute = Math.random() > 0.5 ? 0 : 30;
      break;

    case 'lv2_quarter': {
      // Level 2: 15分 或 45分 (偶爾穿插 0 或 30)
      const optionsQuarter = [15, 45, 15, 45, 0, 30];
      minute = optionsQuarter[Math.floor(Math.random() * optionsQuarter.length)];
      break;
    }

    case 'lv3_five_min': {
      // Level 3: 5的倍數 (0, 5, 10, 15... 55)
      const fiveMins = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55];
      minute = fiveMins[Math.floor(Math.random() * fiveMins.length)];
      break;
    }

    case 'lv4_exact_min': {
      // Level 4: 任意精準分鐘 (如 1:23, 4:47)
      minute = Math.floor(Math.random() * 60);
      break;
    }

    case 'lv5_elapsed_calc': {
      // Level 5: 經過時間計算題
      const baseMinutes = [0, 10, 15, 20, 30, 45];
      minute = baseMinutes[Math.floor(Math.random() * baseMinutes.length)];
      break;
    }
  }

  const targetTime: ClockTime = { hour, minute };
  const randomStory = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];

  if (level === 'lv5_elapsed_calc') {
    // Elapsed time calculation question
    const elapsedMinutesChoices = [15, 20, 25, 30, 35, 40, 45, 50];
    const elapsedMinutes = elapsedMinutesChoices[Math.floor(Math.random() * elapsedMinutesChoices.length)];
    const endTime = addMinutesToTime(targetTime, elapsedMinutes);

    const distractors = generateDistractorTimes(endTime, 'lv3_five_min');
    const correctAnsStr = formatTime(endTime, format);
    const allOptions = [
      correctAnsStr,
      ...distractors.map(d => formatTime(d, format)),
    ].sort(() => Math.random() - 0.5);

    const startTimeStr = formatTime(targetTime, format);
    const storyPrompt = `${randomStory.action}。現在鐘面是 ${startTimeStr}，再過 ${elapsedMinutes} 分鐘後，會是幾點幾分呢？`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      level,
      type: 'elapsed_calc',
      time: targetTime,
      endTime,
      elapsedMinutes,
      options: allOptions,
      correctAnswer: correctAnsStr,
      prompt: `再過 ${elapsedMinutes} 分鐘後是幾點幾分？`,
      storyPrompt,
      explanation: {
        hourExplanation: `開始時間是 ${targetTime.hour} 點 ${targetTime.minute} 分。`,
        minuteExplanation: `加上 ${elapsedMinutes} 分鐘：${targetTime.minute} + ${elapsedMinutes} = ${targetTime.minute + elapsedMinutes} 分。`,
        summary: `經過進位計算後，答案正是【${correctAnsStr}】！`,
      },
      mascot: randomStory.mascot,
    };
  }

  // Standard Clock Reading Question (Levels 1 to 4)
  const distractors = generateDistractorTimes(targetTime, level);
  const correctAnsStr = formatTime(targetTime, format);
  const allOptions = [
    correctAnsStr,
    ...distractors.map(d => formatTime(d, format)),
  ].sort(() => Math.random() - 0.5);

  // Friendly step-by-step breakdown
  const hourSector = hour;
  let hourExp = `時針（藍色短針）指在【${hourSector}】的區域裡，代表現在是【${hour} 點】。`;
  if (minute >= 40) {
    const nextH = (hour % 12) + 1;
    hourExp = `注意看！時針雖然快接近 ${nextH} 了，但還在 ${hour} 和 ${nextH} 之間，所以還是【${hour} 點】喔！`;
  }

  const minuteExp = minute === 0 
    ? `分針（紅色長針）指在最上方的【12】，代表【00分（整點）】。` 
    : minute === 30 
      ? `分針（紅色長針）指在正下方的【6】，6 × 5 = 【30分（半點）】。` 
      : minute % 5 === 0
        ? `分針（紅色長針）指在刻度【${minute / 5}】，${minute / 5} × 5 = 【${minute} 分】。`
        : `分針（紅色長針）指在刻度【${Math.floor(minute / 5)}】再多【${minute % 5} 小格】，代表【${minute} 分】。`;

  return {
    id: Math.random().toString(36).substring(2, 9),
    level,
    type: 'identify_time',
    time: targetTime,
    options: allOptions,
    correctAnswer: correctAnsStr,
    prompt: `請看時鐘，現在是幾點幾分呢？`,
    storyPrompt: `${randomStory.action}，請幫忙看一看時鐘是幾點幾分？`,
    explanation: {
      hourExplanation: hourExp,
      minuteExplanation: minuteExp,
      summary: `時針與分針合起來，正確時間就是【${correctAnsStr}】！`,
    },
    mascot: randomStory.mascot,
  };
}
