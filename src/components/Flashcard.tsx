import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import SignIcon from '@/components/signs/SignIcon';

interface FlashcardProps {
  id: string;
  front: string;
  back: string;
  svg?: string;
  icon?: string;
  tip?: string;
  onFlip?: (isFlipped: boolean) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  id,
  front,
  back,
  svg,
  icon = '🚧',
  tip,
  onFlip,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  return (
    <div 
      className="perspective-1000 w-full aspect-[3/4] cursor-pointer"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Front of card - Sign */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full bg-card rounded-3xl shadow-xl border border-border/50 flex flex-col items-center justify-center p-6 gap-6">
            <SignIcon
              id={id}
              svg={svg}
              icon={icon}
              size={120}
            />
            <p className="text-lg font-semibold text-card-foreground text-center">
              {front}
            </p>
            <div className="absolute bottom-4 flex items-center gap-2 text-muted-foreground text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>Tap to flip</span>
            </div>
          </div>
        </div>

        {/* Back of card - Meaning */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 gap-4 text-primary-foreground">
            <h3 className="text-xl font-bold text-center">{front}</h3>
            <div className="w-16 h-0.5 bg-primary-foreground/30 rounded-full" />
            <p className="text-center text-lg leading-relaxed opacity-90">{back}</p>
            {tip && (
              <div className="mt-4 p-3 bg-primary-foreground/10 rounded-xl">
                <p className="text-sm text-center opacity-80">💡 {tip}</p>
              </div>
            )}
            <div className="absolute bottom-4 flex items-center gap-2 text-primary-foreground/60 text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>Tap to flip back</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
