import React from 'react';

interface CircleSignProps {
  children?: React.ReactNode;
  fillColor?: string;
  borderColor?: string;
  size?: number;
  variant?: 'regulatory' | 'mandatory' | 'prohibition';
}

export const CircleSign: React.FC<CircleSignProps> = ({
  children,
  fillColor = 'hsl(0, 0%, 100%)',
  borderColor = 'hsl(0, 72%, 51%)',
  size = 56,
  variant = 'regulatory',
}) => {
  const isProhibition = variant === 'prohibition';
  const isMandatory = variant === 'mandatory';
  
  const bgColor = isMandatory ? 'hsl(221, 83%, 53%)' : fillColor;
  const strokeColor = isMandatory ? 'hsl(0, 0%, 100%)' : borderColor;
  const symbolColor = isMandatory ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 15%)';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-md">
      {/* Main circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill={bgColor}
        stroke={strokeColor}
        strokeWidth="6"
      />
      
      {/* Inner white circle for regulatory signs */}
      {!isMandatory && (
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="hsl(0, 0%, 100%)"
          stroke="none"
        />
      )}
      
      {/* Prohibition slash */}
      {isProhibition && (
        <line
          x1="20"
          y1="20"
          x2="80"
          y2="80"
          stroke={borderColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      
      <g style={{ color: symbolColor }}>
        {children}
      </g>
    </svg>
  );
};

export default CircleSign;
