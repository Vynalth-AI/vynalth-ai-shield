import React, { type CSSProperties } from 'react';

interface DotMatrixLoaderProps {
  size?: number;       // total grid size in px
  dotSize?: number;    // dot size in px
  color?: string;      // dot color
  speed?: number;      // animation cycle speed in seconds
  preset?: 'spiral' | 'wave' | 'pulse' | 'radar';
  className?: string;
}

const SPIRAL_ORDER_5x5 = [
   0,  1,  2,  3,  4,
  15, 16, 17, 18,  5,
  14, 23, 24, 19,  6,
  13, 22, 21, 20,  7,
  12, 11, 10,  9,  8
];

export const DotMatrixLoader: React.FC<DotMatrixLoaderProps> = ({
  size = 40,
  dotSize = 5,
  color = '#2997ff', // Apple Action Blue default
  speed = 1.2,
  preset = 'spiral',
  className = ''
}) => {
  const dotsCount = 25;
  const gridGap = Math.max(2, Math.floor((size - dotSize * 5) / 4));

  // Keyframes for the loaders
  const uniqueId = React.useId().replace(/:/g, '');

  const renderStyleSheet = () => {
    return (
      <style>{`
        @keyframes dmx-fade-${uniqueId} {
          0%, 100% {
            opacity: 0.12;
            transform: scale(0.9);
            filter: drop-shadow(0 0 0 transparent);
          }
          30% {
            opacity: 1;
            transform: scale(1.15);
            filter: drop-shadow(0 0 4px ${color});
          }
        }
      `}</style>
    );
  };

  const getDelay = (index: number): number => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const center = 2;

    switch (preset) {
      case 'wave':
        // Diagonal wave from top-left to bottom-right
        return ((row + col) / 8) * speed;
      case 'pulse':
        // Outward expansion pulse from center
        const dist = Math.hypot(row - center, col - center);
        const maxDist = Math.hypot(2, 2);
        return (dist / maxDist) * speed * 0.6;
      case 'radar':
        // Circular sweep rotation
        const angle = Math.atan2(row - center, col - center) + Math.PI;
        return (angle / (2 * Math.PI)) * speed;
      case 'spiral':
      default:
        // Clockwise inward spiral
        return (SPIRAL_ORDER_5x5[index] / dotsCount) * speed;
    }
  };

  const containerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
    gap: `${gridGap}px`,
    width: `${size}px`,
    height: `${size}px`,
    alignItems: 'center',
    justifyItems: 'center'
  };

  return (
    <div className={`dot-matrix-loader ${className}`} style={{ display: 'inline-block', position: 'relative' }}>
      {renderStyleSheet()}
      <div style={containerStyle}>
        {Array.from({ length: dotsCount }).map((_, index) => {
          const delay = getDelay(index);
          const dotStyle: CSSProperties = {
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: color,
            animation: `dmx-fade-${uniqueId} ${speed}s infinite ease-in-out`,
            animationDelay: `${delay}s`
          };
          return <span key={index} style={dotStyle} />;
        })}
      </div>
    </div>
  );
};
