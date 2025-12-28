import React from 'react';

interface SignIconProps {
  id: string;
  svg?: string;
  icon?: string;
  size?: number;
  alt?: string;
}

export const SignIcon: React.FC<SignIconProps> = ({
  id,
  svg,
  icon = '🚧',
  size = 56,
  alt,
}) => {
  if (svg) {
    return (
      <img
        src={svg}
        alt={alt ?? id}
        className="object-contain"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <div 
      className="flex items-center justify-center bg-muted rounded-xl text-3xl"
      style={{ width: size, height: size }}
    >
      {icon}
    </div>
  );
};

export default SignIcon;
