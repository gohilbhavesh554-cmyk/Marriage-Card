import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface ScratchCardItemProps {
  label: string;
  mainValue: string;
  subValue: string;
  primaryColor: string;
  accentColor: string;
  foilStart: string;
  foilEnd: string;
  isRevealed: boolean;
  resetCounter: number;
  onRevealed: () => void;
  onScratchSound?: () => void;
}

const SingleScratchCard: React.FC<ScratchCardItemProps> = ({
  label,
  mainValue,
  subValue,
  primaryColor,
  accentColor,
  foilStart,
  foilEnd,
  isRevealed,
  resetCounter,
  onRevealed,
  onScratchSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const strokeCountRef = useRef(0);

  const initFoilCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // Metallic Diagonal Shimmer Gradient matching reference screenshot
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, foilStart);
    grad.addColorStop(0.48, foilEnd);
    grad.addColorStop(1, foilStart);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 16);
    ctx.fill();

    // Soft diagonal sheen highlight
    const sheen = ctx.createLinearGradient(0, 0, width, height);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.5, 'rgba(255,255,255,0.38)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    // Crisp inner white double frame border (exact reference style)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(8, 8, width - 16, height - 16, 11);
    ctx.stroke();

    // Center 4-point sparkle star ✦
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    const cx = width / 2;
    const cy = height / 2;
    const outerR = 7;
    const innerR = 2.2;
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    strokeCountRef.current = 0;
  }, [foilStart, foilEnd]);

  useEffect(() => {
    if (!isRevealed) {
      initFoilCanvas();
    }
  }, [initFoilCanvas, resetCounter, isRevealed]);

  const scratchAtPoint = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    strokeCountRef.current += 1;
    if (strokeCountRef.current % 6 === 1) {
      onScratchSound?.();
    }

    // Check scratched percentage every few strokes
    if (strokeCountRef.current % 5 === 0) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparentPixels = 0;
      const totalSampled = imgData.length / 16;
      for (let i = 3; i < imgData.length; i += 16) {
        if (imgData[i] < 128) transparentPixels++;
      }
      if (transparentPixels / totalSampled > 0.36) {
        onRevealed();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[92px] h-[110px] sm:w-[138px] sm:h-[152px] rounded-2xl bg-white shadow-[0_10px_30px_rgba(22,50,91,0.09)] border select-none overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
        style={{ borderColor: `${accentColor}38` }}
      >
        {/* Revealed Underneath Layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 text-center">
          <Sparkles
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 absolute top-2 right-2 sm:top-2.5 sm:right-2.5 opacity-70"
            style={{ color: accentColor }}
          />
          <div
            className="text-xl sm:text-4xl font-bold tracking-tight leading-none tabular-nums"
            style={{ color: primaryColor }}
          >
            {mainValue}
          </div>
          <div
            className="text-[8px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] font-semibold mt-1.5 sm:mt-2"
            style={{ color: accentColor }}
          >
            {subValue}
          </div>
          <span className="text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 opacity-60" style={{ color: accentColor }}>
            ✦
          </span>
        </div>

        {/* Interactive Scratchable Foil Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={150}
          height={165}
          onMouseDown={(e) => {
            isDrawingRef.current = true;
            scratchAtPoint(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (!isDrawingRef.current) return;
            scratchAtPoint(e.clientX, e.clientY);
          }}
          onMouseUp={() => {
            isDrawingRef.current = false;
          }}
          onMouseLeave={() => {
            isDrawingRef.current = false;
          }}
          onTouchStart={(e) => {
            isDrawingRef.current = true;
            const touch = e.touches[0];
            if (touch) scratchAtPoint(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            if (!isDrawingRef.current) return;
            const touch = e.touches[0];
            if (touch) scratchAtPoint(touch.clientX, touch.clientY);
          }}
          onTouchEnd={() => {
            isDrawingRef.current = false;
          }}
          className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-500 touch-none ${
            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      <span className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#6E6A63] font-medium">
        {label}
      </span>
    </div>
  );
};

interface ScratchDateCardsProps {
  dayNumber: string;
  monthShort: string;
  monthFull: string;
  yearNumber: string;
  primaryColor: string;
  accentColor: string;
  foilStart: string;
  foilEnd: string;
  onScratchChime?: () => void;
}

export const ScratchDateCards: React.FC<ScratchDateCardsProps> = ({
  dayNumber,
  monthShort,
  monthFull,
  yearNumber,
  primaryColor,
  accentColor,
  foilStart,
  foilEnd,
  onScratchChime,
}) => {
  const [revealed, setRevealed] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [resetCounter, setResetCounter] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const anyRevealed = revealed.some(Boolean);
  const allRevealed = revealed.every(Boolean);

  const handleRevealIndex = (idx: 0 | 1 | 2) => {
    setRevealed((prev) => {
      if (prev[idx]) return prev;
      const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean];
      next[idx] = true;
      return next;
    });
    setShowConfetti(true);
    onScratchChime?.();
    setTimeout(() => setShowConfetti(false), 3200);
  };

  const handleQuickRevealAll = () => {
    setRevealed([true, true, true]);
    setShowConfetti(true);
    onScratchChime?.();
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const handleScratchAgain = () => {
    setRevealed([false, false, false]);
    setResetCounter((c) => c + 1);
    setShowConfetti(false);
  };

  return (
    <div className="relative w-full px-6 sm:px-10 mx-auto flex flex-col items-center">
      {/* Celebratory Confetti Particles when revealed (matching reference screenshot 3) */}
      {showConfetti && (
        <div className="absolute -inset-x-6 -inset-y-8 pointer-events-none overflow-hidden z-20">
          {Array.from({ length: 28 }).map((_, i) => {
            const colors = [primaryColor, accentColor, '#E8B4B8', '#D4AF37', '#8ECAE6'];
            const left = `${(i * 3.7) % 100}%`;
            const top = `${(i * 11) % 90}%`;
            return (
              <span
                key={i}
                className="absolute w-2 h-1.5 rounded-xs animate-ping"
                style={{
                  left,
                  top,
                  backgroundColor: colors[i % colors.length],
                  animationDuration: `${0.9 + (i % 4) * 0.35}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* 3 Scratch Cards Row with Generous Side Margins on Mobile */}
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <SingleScratchCard
          label="DAY"
          mainValue={dayNumber}
          subValue={monthFull.toUpperCase()}
          primaryColor={primaryColor}
          accentColor={accentColor}
          foilStart={foilStart}
          foilEnd={foilEnd}
          isRevealed={revealed[0]}
          resetCounter={resetCounter}
          onRevealed={() => handleRevealIndex(0)}
          onScratchSound={onScratchChime}
        />

        <SingleScratchCard
          label="MONTH"
          mainValue={monthShort}
          subValue="MARRIAGE"
          primaryColor={primaryColor}
          accentColor={accentColor}
          foilStart={foilStart}
          foilEnd={foilEnd}
          isRevealed={revealed[1]}
          resetCounter={resetCounter}
          onRevealed={() => handleRevealIndex(1)}
          onScratchSound={onScratchChime}
        />

        <SingleScratchCard
          label="YEAR"
          mainValue={yearNumber}
          subValue="CELEBRATION"
          primaryColor={primaryColor}
          accentColor={accentColor}
          foilStart={foilStart}
          foilEnd={foilEnd}
          isRevealed={revealed[2]}
          resetCounter={resetCounter}
          onRevealed={() => handleRevealIndex(2)}
          onScratchSound={onScratchChime}
        />
      </div>

      {/* Action Link: QUICK REVEAL ALL or SCRATCH AGAIN */}
      <div className="mt-6 flex items-center gap-5">
        {!allRevealed && (
          <button
            type="button"
            onClick={handleQuickRevealAll}
            className="text-[11px] uppercase tracking-[0.18em] font-semibold border-b pb-0.5 transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            QUICK REVEAL ALL
          </button>
        )}

        {anyRevealed && (
          <button
            type="button"
            onClick={handleScratchAgain}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#6E6A63] hover:text-[#292720] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>SCRATCH AGAIN</span>
          </button>
        )}
      </div>
    </div>
  );
};
