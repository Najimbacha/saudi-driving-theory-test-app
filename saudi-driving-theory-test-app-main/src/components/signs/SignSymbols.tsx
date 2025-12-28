import React from 'react';

interface SymbolProps {
  className?: string;
}

export const ExclamationSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="70" textAnchor="middle" fontSize="40" fontWeight="bold" className={className} fill="currentColor">!</text>
);

export const CurveLeftSymbol: React.FC<SymbolProps> = ({ className }) => (
  <path d="M60 65 Q35 65 35 45 L35 35" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className={className} />
);

export const CurveRightSymbol: React.FC<SymbolProps> = ({ className }) => (
  <path d="M40 65 Q65 65 65 45 L65 35" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className={className} />
);

export const ConstructionSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <rect x="30" y="55" width="40" height="8" fill="currentColor" />
    <polygon points="50,30 35,55 65,55" fill="currentColor" />
  </g>
);

export const PedestrianSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <circle cx="50" cy="32" r="6" />
    <path d="M50 38 L50 55 M50 45 L40 52 M50 45 L60 52 M50 55 L42 70 M50 55 L58 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
  </g>
);

export const SchoolSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <circle cx="42" cy="35" r="5" />
    <circle cx="58" cy="35" r="5" />
    <path d="M42 40 L42 55 M42 48 L35 55 M42 48 L49 55 M42 55 L38 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M58 40 L58 55 M58 48 L51 55 M58 48 L65 55 M58 55 L62 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
  </g>
);

export const AnimalSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <ellipse cx="50" cy="50" rx="18" ry="12" />
    <ellipse cx="68" cy="42" rx="8" ry="6" />
    <path d="M35 62 L35 72 M42 62 L42 72 M58 62 L58 72 M65 62 L65 72" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
  </g>
);

export const ArrowDownSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M50 30 L50 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <polygon points="50,75 35,55 65,55" fill="currentColor" />
  </g>
);

export const ArrowUpSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M50 70 L50 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <polygon points="50,25 35,45 65,45" fill="currentColor" />
  </g>
);

export const SlipperySymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M30 55 Q40 45 50 55 Q60 65 70 55" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
    <rect x="40" y="40" width="20" height="12" rx="2" fill="currentColor" />
  </g>
);

export const TwoWaySymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M30 50 L70 50" stroke="currentColor" strokeWidth="5" />
    <polygon points="25,50 35,42 35,58" fill="currentColor" />
    <polygon points="75,50 65,42 65,58" fill="currentColor" />
  </g>
);

export const MergeSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M40 70 L40 45 L50 35 L60 45 L60 70" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const RoundaboutSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="5" />
    <polygon points="50,30 45,20 55,20" fill="currentColor" />
    <polygon points="70,50 80,45 80,55" fill="currentColor" />
    <polygon points="30,50 20,45 20,55" fill="currentColor" />
  </g>
);

export const IntersectionSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M50 30 L50 70 M30 50 L70 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </g>
);

export const RailwaySymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M30 35 L70 65 M70 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="50" r="3" fill="currentColor" />
  </g>
);

export const WindSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M25 40 Q45 35 55 40 Q65 45 75 40" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M25 50 Q45 45 55 50 Q65 55 75 50" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M25 60 Q45 55 55 60 Q65 65 75 60" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
  </g>
);

export const CyclistSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <circle cx="35" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="65" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M35 60 L50 45 L65 60 M50 45 L50 35 M45 35 L55 35" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="30" r="5" fill="currentColor" />
  </g>
);

export const FloodSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M25 55 Q35 50 45 55 Q55 60 65 55 Q75 50 85 55" stroke="currentColor" strokeWidth="4" fill="none" />
    <path d="M25 65 Q35 60 45 65 Q55 70 65 65 Q75 60 85 65" stroke="currentColor" strokeWidth="4" fill="none" />
    <rect x="42" y="35" width="16" height="15" rx="2" fill="currentColor" />
  </g>
);

export const RocksSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <polygon points="50,30 65,55 35,55" />
    <polygon points="35,55 45,70 25,70" />
    <polygon points="55,55 75,70 45,70" />
  </g>
);

export const StopSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="58" textAnchor="middle" fontSize="20" fontWeight="bold" className={className} fill="currentColor">STOP</text>
);

export const YieldSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" className={className} fill="currentColor">YIELD</text>
);

export const NoEntrySymbol: React.FC<SymbolProps> = ({ className }) => (
  <rect x="25" y="45" width="50" height="12" rx="2" fill="currentColor" className={className} />
);

export const SpeedLimitSymbol: React.FC<SymbolProps & { limit?: string }> = ({ className, limit = "50" }) => (
  <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="bold" className={className} fill="currentColor">{limit}</text>
);

export const NoOvertakingSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <rect x="28" y="40" width="18" height="25" rx="4" fill="currentColor" />
    <rect x="54" y="40" width="18" height="25" rx="4" fill="hsl(var(--destructive))" />
  </g>
);

export const NoParkingSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="60" textAnchor="middle" fontSize="32" fontWeight="bold" className={className} fill="currentColor">P</text>
);

export const NoHornSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <path d="M35 45 L35 60 L50 60 L65 70 L65 35 L50 45 Z" />
    <path d="M70 50 Q78 50 78 55 Q78 60 70 60" stroke="currentColor" strokeWidth="3" fill="none" />
  </g>
);

export const TurnRightSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M40 70 L40 50 Q40 40 50 40 L60 40" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polygon points="70,40 55,30 55,50" fill="currentColor" />
  </g>
);

export const TurnLeftSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M60 70 L60 50 Q60 40 50 40 L40 40" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polygon points="30,40 45,30 45,50" fill="currentColor" />
  </g>
);

export const StraightSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M50 70 L50 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <polygon points="50,25 38,45 62,45" fill="currentColor" />
  </g>
);

export const UTurnSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M35 70 L35 45 Q35 30 50 30 Q65 30 65 45 L65 55" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
    <polygon points="65,65 55,50 75,50" fill="currentColor" />
  </g>
);

export const KeepRightSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M40 50 L60 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <polygon points="70,50 55,40 55,60" fill="currentColor" />
  </g>
);

export const KeepLeftSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M60 50 L40 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <polygon points="30,50 45,40 45,60" fill="currentColor" />
  </g>
);

export const HospitalSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <rect x="45" y="30" width="10" height="40" />
    <rect x="30" y="45" width="40" height="10" />
  </g>
);

export const ParkingSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="62" textAnchor="middle" fontSize="36" fontWeight="bold" className={className} fill="currentColor">P</text>
);

export const FuelSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <rect x="32" y="35" width="25" height="30" rx="2" />
    <path d="M57 40 L65 35 L65 55 L57 50" stroke="currentColor" strokeWidth="3" fill="none" />
  </g>
);

export const RestaurantSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <rect x="35" y="30" width="4" height="40" rx="1" />
    <rect x="42" y="30" width="4" height="40" rx="1" />
    <ellipse cx="58" cy="35" rx="10" ry="8" />
    <rect x="56" y="40" width="4" height="30" rx="1" />
  </g>
);

export const InfoSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="62" textAnchor="middle" fontSize="38" fontWeight="bold" fontStyle="italic" className={className} fill="currentColor">i</text>
);

export const AirportSymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className} fill="currentColor">
    <path d="M50 25 L50 75 M35 45 L65 45 M40 65 L60 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <polygon points="50,25 42,40 58,40" />
  </g>
);

export const OneWaySymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M25 50 L65 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <polygon points="75,50 60,38 60,62" fill="currentColor" />
  </g>
);

export const HighwaySymbol: React.FC<SymbolProps> = ({ className }) => (
  <g className={className}>
    <path d="M35 70 L45 30 L55 30 L65 70" stroke="currentColor" strokeWidth="4" fill="none" strokeLinejoin="round" />
    <path d="M40 55 L60 55" stroke="currentColor" strokeWidth="3" />
  </g>
);

// Default symbol for unknown types
export const DefaultSymbol: React.FC<SymbolProps> = ({ className }) => (
  <text x="50" y="58" textAnchor="middle" fontSize="24" className={className} fill="currentColor">?</text>
);
