/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { ClockSettings, ClockTime } from '../types/clock';
import { getHourHandAngle, getMinuteHandAngle, getSecondHandAngle } from '../utils/clockMath';
import { soundEngine } from '../utils/audio';

interface ClockCanvasProps {
  time: ClockTime;
  settings: ClockSettings;
  interactive?: boolean;
  onTimeChange?: (time: ClockTime) => void;
  highlightElapsedMinutes?: number; // Arc highlight for Level 5 elapsed questions
  size?: number;
}

// 12 soft pastel colors for hour sectors to teach "hour territories"
const HOUR_SECTOR_COLORS = [
  'rgba(254, 226, 226, 0.45)', // 12-1: soft red
  'rgba(254, 243, 199, 0.45)', // 1-2: soft amber
  'rgba(254, 249, 195, 0.45)', // 2-3: soft yellow
  'rgba(236, 252, 203, 0.45)', // 3-4: soft lime
  'rgba(220, 252, 231, 0.45)', // 4-5: soft green
  'rgba(204, 251, 241, 0.45)', // 5-6: soft teal
  'rgba(224, 242, 254, 0.45)', // 6-7: soft sky
  'rgba(219, 234, 254, 0.45)', // 7-8: soft blue
  'rgba(238, 242, 255, 0.45)', // 8-9: soft indigo
  'rgba(243, 232, 255, 0.45)', // 9-10: soft purple
  'rgba(250, 232, 255, 0.45)', // 10-11: soft fuchsia
  'rgba(255, 228, 230, 0.45)', // 11-12: soft rose
];

export const ClockCanvas: React.FC<ClockCanvasProps> = ({
  time,
  settings,
  interactive = false,
  onTimeChange,
  highlightElapsedMinutes,
  size = 320,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState<'minute' | 'hour' | null>(null);
  const [liveSecond, setLiveSecond] = useState(time.second || 0);

  // Live ticking second hand if enabled and not currently dragging
  useEffect(() => {
    if (!settings.showSecondHand || isDragging) return;
    const interval = setInterval(() => {
      setLiveSecond(s => (s + 1) % 60);
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.showSecondHand, isDragging]);

  const radius = 150;
  const center = 160;

  const hourAngle = getHourHandAngle(time.hour, time.minute, settings.showSecondHand ? liveSecond : 0);
  const minuteAngle = getMinuteHandAngle(time.minute, settings.showSecondHand ? liveSecond : 0);
  const secondAngle = getSecondHandAngle(liveSecond);

  // Drag interaction to allow kids to physically spin hands in free practice mode
  const handlePointerDown = (hand: 'minute' | 'hour') => (e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setIsDragging(hand);
    soundEngine.playPop();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !interactive || !svgRef.current || !onTimeChange) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Angle in degrees from 12 o'clock
    let deg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    if (isDragging === 'minute') {
      const snappedMinute = Math.round(deg / 6) % 60;
      if (snappedMinute !== time.minute) {
        soundEngine.playTick();
        // If minute wrapped from 59 to 0 or 0 to 59, update hour accordingly
        let newHour = time.hour;
        if (time.minute >= 50 && snappedMinute <= 10) {
          newHour = (time.hour % 12) + 1;
        } else if (time.minute <= 10 && snappedMinute >= 50) {
          newHour = time.hour === 1 ? 12 : time.hour - 1;
        }
        onTimeChange({ hour: newHour, minute: snappedMinute, second: 0 });
      }
    } else if (isDragging === 'hour') {
      const snappedHour = Math.floor(deg / 30) || 12;
      if (snappedHour !== time.hour) {
        soundEngine.playTick();
        onTimeChange({ hour: snappedHour, minute: time.minute, second: 0 });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      setIsDragging(null);
    }
  };

  // Helper to calculate SVG path for sector slices
  const createSectorPath = (startHourIndex: number) => {
    const startAngle = (startHourIndex * 30 - 90) * (Math.PI / 180);
    const endAngle = ((startHourIndex + 1) * 30 - 90) * (Math.PI / 180);
    const r = radius - 15;
    const x1 = center + r * Math.cos(startAngle);
    const y1 = center + r * Math.sin(startAngle);
    const x2 = center + r * Math.cos(endAngle);
    const y2 = center + r * Math.sin(endAngle);
    return `M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  // Helper to calculate elapsed minute arc for Level 5
  const createElapsedArc = (startMinute: number, elapsedMinutes: number) => {
    const startDeg = (startMinute * 6 - 90) * (Math.PI / 180);
    const endDeg = ((startMinute + elapsedMinutes) * 6 - 90) * (Math.PI / 180);
    const r = radius - 24;
    const x1 = center + r * Math.cos(startDeg);
    const y1 = center + r * Math.sin(startDeg);
    const x2 = center + r * Math.cos(endDeg);
    const y2 = center + r * Math.sin(endDeg);
    const largeArc = elapsedMinutes > 30 ? 1 : 0;
    return `M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div
      className="relative flex items-center justify-center select-none touch-none w-full mx-auto"
      style={{ maxWidth: size, maxHeight: size, aspectRatio: '1 / 1' }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
        className="w-full h-full drop-shadow-xl select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          {/* Wood bezel radial gradient */}
          <radialGradient id="woodBezel" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#855831" />
            <stop offset="93%" stopColor="#633F1F" />
            <stop offset="100%" stopColor="#4A2F17" />
          </radialGradient>

          {/* Inner bezel gold trim */}
          <radialGradient id="goldTrim" cx="45%" cy="45%" r="55%">
            <stop offset="88%" stopColor="#FDE68A" />
            <stop offset="96%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>

          {/* Clean ivory face gradient */}
          <radialGradient id="clockFace" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#FDFBF7" />
            <stop offset="100%" stopColor="#F5EFE6" />
          </radialGradient>

          {/* Center cap metallic gradient */}
          <radialGradient id="brassPin" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="90%" stopColor="#A16207" />
            <stop offset="100%" stopColor="#713F12" />
          </radialGradient>

          {/* Hand shadow filter */}
          <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#3F2713" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Wooden Clock Ring */}
        <circle cx={center} cy={center} r={radius + 8} fill="url(#woodBezel)" />
        {/* Golden Inlay Accent */}
        <circle cx={center} cy={center} r={radius} fill="url(#goldTrim)" />
        {/* Main Clock Dial Face */}
        <circle cx={center} cy={center} r={radius - 7} fill="url(#clockFace)" />

        {/* Optional Hour Rainbow Sectors (Territories to understand hour hand belongs to which hour) */}
        {settings.showHourZoneColors && (
          <g className="transition-opacity duration-300">
            {Array.from({ length: 12 }).map((_, idx) => (
              <path
                key={`sector-${idx}`}
                d={createSectorPath(idx)}
                fill={HOUR_SECTOR_COLORS[idx]}
                className="transition-colors"
              />
            ))}
          </g>
        )}

        {/* Optional Level 5 Elapsed Time Highlight Arc */}
        {highlightElapsedMinutes && highlightElapsedMinutes > 0 && (
          <g>
            <path
              d={createElapsedArc(time.minute, highlightElapsedMinutes)}
              fill="rgba(34, 197, 94, 0.22)"
              stroke="#16A34A"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          </g>
        )}

        {/* 60 Minute Ticks */}
        {settings.showMinuteTicks && (
          <g>
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const angle = i * 6 * (Math.PI / 180);
              const tickLength = isMajor ? 10 : 5;
              const outerR = radius - 12;
              const innerR = outerR - tickLength;

              const x1 = center + outerR * Math.sin(angle);
              const y1 = center - outerR * Math.cos(angle);
              const x2 = center + innerR * Math.sin(angle);
              const y2 = center - innerR * Math.cos(angle);

              return (
                <line
                  key={`tick-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#475569' : '#CBD5E1'}
                  strokeWidth={isMajor ? 2.5 : 1.2}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {/* Optional Minute Labels on outer edge (00, 05, 10 ... 55) */}
        {settings.showMinuteNumbers && (
          <g>
            {Array.from({ length: 12 }).map((_, i) => {
              const minVal = i * 5;
              const angle = i * 30 * (Math.PI / 180);
              const labelR = radius - 24;
              const x = center + labelR * Math.sin(angle);
              const y = center - labelR * Math.cos(angle);

              return (
                <text
                  key={`min-label-${i}`}
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="#E11D48"
                  className="font-mono select-none"
                >
                  {minVal.toString().padStart(2, '0')}
                </text>
              );
            })}
          </g>
        )}

        {/* 12 Hour Numbers (1, 2, ..., 12) */}
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const hourVal = i + 1;
            const angle = hourVal * 30 * (Math.PI / 180);
            // If minute numbers are shown, pull hour numbers slightly inward for ample space
            const labelR = settings.showMinuteNumbers ? radius - 44 : radius - 34;
            const x = center + labelR * Math.sin(angle);
            const y = center - labelR * Math.cos(angle);

            return (
              <text
                key={`hour-num-${hourVal}`}
                x={x}
                y={y + 7}
                textAnchor="middle"
                fontSize={settings.showMinuteNumbers ? '20' : '23'}
                fontWeight="800"
                fill="#1E293B"
                className="font-bold select-none cursor-default tracking-tight"
                style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
              >
                {hourVal}
              </text>
            );
          })}
        </g>

        {/* Interactive indicator hint */}
        {interactive && (
          <text
            x={center}
            y={center + 58}
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fill="#94A3B8"
            className="tracking-wider uppercase"
          >
            可拖曳指針調整時間
          </text>
        )}

        {/* HANDS GROUP */}
        {/* 1. Hour Hand (Blue, Thicker, Shorter) */}
        <g
          transform={`rotate(${hourAngle} ${center} ${center})`}
          filter="url(#handShadow)"
          className={interactive ? 'cursor-grab active:cursor-grabbing' : ''}
          onPointerDown={handlePointerDown('hour')}
        >
          {/* Hour hand body */}
          <path
            d={`M ${center - 4.5} ${center + 14} 
               L ${center - 4} ${center - 55} 
               L ${center} ${center - 70} 
               L ${center + 4} ${center - 55} 
               L ${center + 4.5} ${center + 14} Z`}
            fill={settings.colorCodedHands ? '#2563EB' : '#1E293B'}
            stroke="#1D4ED8"
            strokeWidth="0.8"
          />
          {/* Hour hand inner stripe for contrast */}
          <line
            x1={center}
            y1={center - 10}
            x2={center}
            y2={center - 54}
            stroke="#93C5FD"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* 2. Minute Hand (Rose/Coral Red, Longer, Pointed Arrow) */}
        <g
          transform={`rotate(${minuteAngle} ${center} ${center})`}
          filter="url(#handShadow)"
          className={interactive ? 'cursor-grab active:cursor-grabbing' : ''}
          onPointerDown={handlePointerDown('minute')}
        >
          {/* Minute hand body */}
          <path
            d={`M ${center - 3.5} ${center + 18} 
               L ${center - 3} ${center - 88} 
               L ${center} ${center - 104} 
               L ${center + 3} ${center - 88} 
               L ${center + 3.5} ${center + 18} Z`}
            fill={settings.colorCodedHands ? '#E11D48' : '#334155'}
            stroke="#BE123C"
            strokeWidth="0.8"
          />
          {/* Minute hand inner highlight stripe */}
          <line
            x1={center}
            y1={center - 12}
            x2={center}
            y2={center - 86}
            stroke="#FDA4AF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>

        {/* 3. Second Hand (Slim Gold with Tail Circle) */}
        {settings.showSecondHand && (
          <g transform={`rotate(${secondAngle} ${center} ${center})`} filter="url(#handShadow)">
            <line
              x1={center}
              y1={center + 24}
              x2={center}
              y2={center - 108}
              stroke="#D97706"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx={center} cy={center + 14} r="3.5" fill="#D97706" />
            <circle cx={center} cy={center - 80} r="2.5" fill="#D97706" />
          </g>
        )}

        {/* Center Brass Cap / Nut */}
        <circle cx={center} cy={center} r="7" fill="url(#brassPin)" filter="url(#handShadow)" />
        <circle cx={center} cy={center} r="2.5" fill="#FFFFFF" opacity="0.6" />
      </svg>
    </div>
  );
};
