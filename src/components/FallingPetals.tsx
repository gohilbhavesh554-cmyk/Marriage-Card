import React, { useMemo } from 'react';

interface FallingPetalsProps {
  color?: string;
}

export const FallingPetals: React.FC<FallingPetalsProps> = ({ color = '#F2C1BA' }) => {
  const petals = useMemo(() => {
    return Array.from({ length: 18 }).map((_, idx) => ({
      id: idx,
      left: `${(idx * 5.7 + (idx % 3) * 4) % 98}%`,
      delay: `${(idx * 1.3) % 14}s`,
      duration: `${13 + (idx % 7) * 2.2}s`,
      size: 12 + (idx % 4) * 4,
      opacity: 0.45 + (idx % 3) * 0.15,
      sway: idx % 2 === 0 ? 35 : -35,
      initialRotate: (idx * 45) % 360,
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-20 no-print"
      aria-hidden="true"
    >
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg) rotateX(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          50% {
            transform: translate3d(28px, 48vh, 0) rotate(180deg) rotateX(40deg);
          }
          90% {
            opacity: 0.65;
          }
          100% {
            transform: translate3d(-20px, 108vh, 0) rotate(360deg) rotateX(80deg);
            opacity: 0;
          }
        }
      `}</style>
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-30px',
            width: `${p.size}px`,
            height: `${p.size * 1.35}px`,
            opacity: p.opacity,
            animation: `petalFall ${p.duration} linear ${p.delay} infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 32"
            fill="none"
            className="w-full h-full"
            style={{ transform: `rotate(${p.initialRotate}deg)` }}
          >
            <path
              d="M12 1C6 7 2 14 3 22C4 28 8 31 12 31C16 31 20 28 21 22C22 14 18 7 12 1Z"
              fill={color}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
