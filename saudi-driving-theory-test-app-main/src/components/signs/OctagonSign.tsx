import React from 'react';

interface OctagonSignProps {
  children?: React.ReactNode;
  fillColor?: string;
  borderColor?: string;
  size?: number;
}

export const OctagonSign: React.FC<OctagonSignProps> = ({
  children,
  fillColor = 'hsl(0, 72%, 51%)',
  borderColor = 'hsl(0, 0%, 100%)',
  size = 56,
}) => {
  // Octagon points calculated for a centered shape
  const points = "30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30";

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-md">
      <polygon
        points={points}
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

export default OctagonSign;
