import React from 'react';

interface TriangleSignProps {
  children?: React.ReactNode;
  fillColor?: string;
  borderColor?: string;
  size?: number;
  inverted?: boolean;
}

export const TriangleSign: React.FC<TriangleSignProps> = ({
  children,
  fillColor = 'hsl(48, 96%, 53%)',
  borderColor = 'hsl(0, 0%, 15%)',
  size = 56,
  inverted = false,
}) => {
  const points = inverted 
    ? "5,10 95,10 50,90"  // Yield sign (inverted)
    : "50,5 95,85 5,85";  // Warning sign

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-md">
      <polygon
        points={points}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g className="text-foreground" style={{ color: borderColor }}>
        {children}
      </g>
    </svg>
  );
};

export default TriangleSign;
