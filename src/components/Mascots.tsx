/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MascotType } from '../types/clock';

interface MascotProps {
  type: MascotType;
  mood?: 'idle' | 'celebrating' | 'thinking' | 'encouraging';
  size?: number;
  className?: string;
}

export const MascotAvatar: React.FC<MascotProps> = ({
  type,
  mood = 'idle',
  size = 64,
  className = '',
}) => {
  const isBouncing = mood === 'celebrating';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 ${
        isBouncing ? 'animate-bounce' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {type === 'owl' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Owl Body */}
          <ellipse cx="50" cy="56" rx="34" ry="38" fill="#78350F" />
          {/* Belly Feather patch */}
          <ellipse cx="50" cy="62" rx="22" ry="24" fill="#FEF3C7" />
          {/* Belly chevron feathers */}
          <path d="M 44 56 Q 50 60 56 56" stroke="#D97706" strokeWidth="2" fill="none" />
          <path d="M 43 65 Q 50 69 57 65" stroke="#D97706" strokeWidth="2" fill="none" />
          <path d="M 45 74 Q 50 78 55 74" stroke="#D97706" strokeWidth="2" fill="none" />
          {/* Owl Ear Tufts */}
          <polygon points="26,24 38,36 20,40" fill="#92400E" />
          <polygon points="74,24 62,36 80,40" fill="#92400E" />
          {/* Eyes Glasses Background */}
          <circle cx="37" cy="42" r="14" fill="#FFFFFF" stroke="#451A03" strokeWidth="2.5" />
          <circle cx="63" cy="42" r="14" fill="#FFFFFF" stroke="#451A03" strokeWidth="2.5" />
          <line x1="51" y1="42" x2="49" y2="42" stroke="#451A03" strokeWidth="2.5" />
          {/* Pupils */}
          <circle cx={mood === 'thinking' ? 39 : 37} cy="42" r="6" fill="#1E293B" />
          <circle cx={mood === 'thinking' ? 65 : 63} cy="42" r="6" fill="#1E293B" />
          {/* Sparkles in eyes */}
          <circle cx="35" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="61" cy="40" r="2" fill="#FFFFFF" />
          {/* Golden Beak */}
          <polygon points="46,47 54,47 50,56" fill="#F59E0B" />
          {/* Cute Graduation/Professor Cap */}
          <polygon points="50,12 80,22 50,30 20,22" fill="#1E3A8A" />
          <rect x="42" y="22" width="16" height="8" fill="#1E40AF" rx="2" />
          <line x1="75" y1="24" x2="78" y2="36" stroke="#FBBF24" strokeWidth="2" />
          <circle cx="78" cy="37" r="2" fill="#FBBF24" />
        </svg>
      )}

      {type === 'squirrel' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Bushy Tail */}
          <path
            d="M 68 76 C 92 72 98 40 85 24 C 74 10 56 18 64 36 C 68 45 68 58 60 70 Z"
            fill="#B45309"
          />
          {/* Squirrel Body */}
          <ellipse cx="45" cy="58" rx="26" ry="28" fill="#D97706" />
          <ellipse cx="44" cy="62" rx="16" ry="18" fill="#FEF3C7" />
          {/* Squirrel Head */}
          <circle cx="45" cy="38" rx="20" ry="18" fill="#D97706" />
          {/* Ears */}
          <ellipse cx="33" cy="22" rx="6" ry="10" fill="#B45309" transform="rotate(-15 33 22)" />
          <ellipse cx="57" cy="22" rx="6" ry="10" fill="#B45309" transform="rotate(15 57 22)" />
          {/* Eyes */}
          <circle cx="37" cy="36" r="4.5" fill="#1E293B" />
          <circle cx="53" cy="36" r="4.5" fill="#1E293B" />
          <circle cx="36" cy="34.5" r="1.5" fill="#FFFFFF" />
          <circle cx="52" cy="34.5" r="1.5" fill="#FFFFFF" />
          {/* Snout and Nose */}
          <ellipse cx="45" cy="43" rx="7" ry="5" fill="#FEF3C7" />
          <polygon points="43,41 47,41 45,44" fill="#451A03" />
          {/* Rosy Cheeks */}
          <ellipse cx="31" cy="42" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="59" cy="42" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />
          {/* Acorn in paws */}
          <ellipse cx="45" cy="66" rx="8" ry="10" fill="#78350F" />
          <path d="M 37 60 Q 45 56 53 60" fill="#451A03" stroke="#451A03" strokeWidth="2" />
        </svg>
      )}

      {type === 'rabbit' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Long Ears */}
          <ellipse cx="36" cy="18" rx="7" ry="20" fill="#E2E8F0" transform="rotate(-8 36 18)" />
          <ellipse cx="36" cy="18" rx="4" ry="14" fill="#FBCFE8" transform="rotate(-8 36 18)" />
          <ellipse cx="64" cy="18" rx="7" ry="20" fill="#E2E8F0" transform="rotate(8 64 18)" />
          <ellipse cx="64" cy="18" rx="4" ry="14" fill="#FBCFE8" transform="rotate(8 64 18)" />
          {/* Rabbit Body */}
          <ellipse cx="50" cy="66" rx="26" ry="24" fill="#F1F5F9" />
          <ellipse cx="50" cy="68" rx="16" ry="16" fill="#FFFFFF" />
          {/* Rabbit Head */}
          <circle cx="50" cy="42" r="22" fill="#F8FAFC" />
          {/* Eyes */}
          <ellipse cx="41" cy="40" rx="4" ry="5" fill="#3B82F6" />
          <ellipse cx="59" cy="40" rx="4" ry="5" fill="#3B82F6" />
          <circle cx="40" cy="38" r="1.5" fill="#FFFFFF" />
          <circle cx="58" cy="38" r="1.5" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <polygon points="48,46 52,46 50,49" fill="#F472B6" />
          <path d="M 47 49 Q 50 53 53 49" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
          {/* Rosy Cheeks */}
          <ellipse cx="34" cy="45" rx="4" ry="3" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="66" cy="45" rx="4" ry="3" fill="#FDA4AF" opacity="0.8" />
          {/* Cute Golden Pocket Watch */}
          <circle cx="50" cy="74" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="50" cy="74" r="6" fill="#FEF3C7" />
          <line x1="50" y1="74" x2="50" y2="70" stroke="#78350F" strokeWidth="1.2" />
          <line x1="50" y1="74" x2="53" y2="74" stroke="#DC2626" strokeWidth="1" />
        </svg>
      )}

      {type === 'bear' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Round Ears */}
          <circle cx="28" cy="25" r="11" fill="#78350F" />
          <circle cx="28" cy="25" r="6" fill="#FDE68A" />
          <circle cx="72" cy="25" r="11" fill="#78350F" />
          <circle cx="72" cy="25" r="6" fill="#FDE68A" />
          {/* Bear Head */}
          <circle cx="50" cy="45" r="26" fill="#92400E" />
          {/* Snout */}
          <ellipse cx="50" cy="52" rx="14" ry="10" fill="#FEF3C7" />
          <ellipse cx="50" cy="48" rx="6" ry="4" fill="#451A03" />
          <path d="M 47 54 Q 50 58 53 54" stroke="#451A03" strokeWidth="2" fill="none" />
          {/* Eyes */}
          <circle cx="41" cy="40" r="3.5" fill="#1E293B" />
          <circle cx="59" cy="40" r="3.5" fill="#1E293B" />
          <circle cx="40" cy="38.5" r="1" fill="#FFFFFF" />
          <circle cx="58" cy="38.5" r="1" fill="#FFFFFF" />
          {/* Body */}
          <ellipse cx="50" cy="78" rx="28" ry="20" fill="#78350F" />
          {/* Little Bow Tie */}
          <polygon points="44,66 50,68 44,70" fill="#EF4444" />
          <polygon points="56,66 50,68 56,70" fill="#EF4444" />
          <circle cx="50" cy="68" r="2" fill="#B91C1C" />
        </svg>
      )}
    </div>
  );
};

export const MASCOT_DETAILS: Record<MascotType, { name: string; title: string; welcome: string; cheer: string }> = {
  owl: {
    name: '貓頭鷹博士',
    title: '智慧引路人',
    welcome: '呼呼！我是貓頭鷹博士。仔細觀察時針和分針的腳步，你一定能找到時間的秘密！',
    cheer: '太精彩了！你的觀察力就像貓頭鷹的眼睛一樣敏銳！',
  },
  squirrel: {
    name: '小松鼠奇奇',
    title: '森林烘焙師',
    welcome: '哈囉！我是小松鼠奇奇！烤堅果派最需要精準的時間了，跟我一起來挑戰吧！',
    cheer: '哇！答對了！就像摘到一顆金黃飽滿的橡實一樣棒！',
  },
  rabbit: {
    name: '兔子波波',
    title: '時間精靈',
    welcome: '蹦蹦跳跳！我是波波。我的懷錶滴答走，看看誰能最快發現正確的時間！',
    cheer: '好厲害！滴答滴答～你已經是真正的小鐘錶大師了！',
  },
  bear: {
    name: '熊熊老師',
    title: '暖心大玩偶',
    welcome: '別著急，深呼吸！一步一步看清楚，熊熊老師一直在這裡幫你加油喔！',
    cheer: '溫暖又棒極了！給自己一個大大的掌聲！',
  },
};
