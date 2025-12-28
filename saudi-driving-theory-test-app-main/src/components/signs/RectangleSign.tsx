import React from 'react';

interface RectangleSignProps {
  children?: React.ReactNode;
  fillColor?: string;
  borderColor?: string;
  size?: number;
  aspectRatio?: 'square' | 'wide' | 'tall';
}

export const RectangleSign: React.FC<RectangleSignProps> = ({
  children,
  fillColor = 'hsl(142, 71%, 35%)',
  borderColor = 'hsl(0, 0%, 100%)',
  size = 56,
  aspectRatio = 'square',
}) => {
  const getViewBox = () => {
    switch (aspectRatio) {
      case 'wide': return '0 0 140 100';
      case 'tall': return '0 0 100 140';
      default: return '0 0 100 100';
    }
  };

  const getWidth = () => {
    switch (aspectRatio) {
      case 'wide': return size * 1.4;
      case 'tall': return size * 0.71;
      default: return size;
    }
  };

  const getHeight = () => {
    switch (aspectRatio) {
      case 'wide': return size;
      case 'tall': return size * 1.4;
      default: return size;
    }
  };

  const getRect = () => {
    switch (aspectRatio) {
      case 'wide': return { x: 5, y: 5, width: 130, height: 90 };
      case 'tall': return { x: 5, y: 5, width: 90, height: 130 };
      default: return { x: 5, y: 5, width: 90, height: 90 };
    }
  };

  const rect = getRect();

  return (
    <svg viewBox={getViewBox()} width={getWidth()} height={getHeight()} className="drop-shadow-md">
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        rx="8"
        fill={fillColor}
        stroke={borderColor}
        strokeWidth="4"
      />
      <g style={{ color: borderColor }}>
        {children}
      </g>
    </svg>
  );
};

export default RectangleSign;
