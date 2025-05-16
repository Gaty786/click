import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameState } from '@/lib/stores/useGameState';
import { formatCurrency, formatRate } from '@/lib/helpers/formatters';

export function Currency() {
  const { currency, currencyPerSecond } = useGameState();
  const [displayValue, setDisplayValue] = useState(currency);
  
  // Update the animated value when currency changes
  useEffect(() => {
    const controls = animate(displayValue, currency, {
      duration: 0.5,
      onUpdate: (value) => setDisplayValue(value)
    });
    
    return () => controls.stop();
  }, [currency, displayValue]);
  
  return (
    <div className="my-6 flex flex-col items-center">
      <motion.div
        className="text-4xl md:text-5xl font-bold text-yellow-400"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ 
          duration: 0.3, 
          repeat: Infinity, 
          repeatType: "reverse", 
          repeatDelay: 1 
        }}
      >
        <span>
          {formatCurrency(Math.floor(displayValue))}
        </span>
      </motion.div>
      
      {currencyPerSecond > 0 && (
        <div className="text-sm text-gray-300 mt-2">
          +{formatRate(currencyPerSecond)} per second
        </div>
      )}
    </div>
  );
}
