import React from 'react';

interface DiamondSignProps {
  children?: React.ReactNode;
  fillColor?: string;
  borderColor?: string;
  size?: number;
}

export const DiamondSign: React.FC<DiamondSignProps> = ({
  children,
  fillColor = 'hsl(38, 92%, 50%)',
  borderColor = 'hsl(0, 0%, 15%)',
  size = 56,
}) => {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-md">
      <polygon
        points="50,5 95,50 50,95 5,50"
        fill={fillColor}
        stroke={borderColor}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g style={{ color: borderColor }}>
        {children}
      </g>
    </svg>
  );
};

export default DiamondSign;
