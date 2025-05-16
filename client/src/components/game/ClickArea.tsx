import { useState, useEffect } from 'react';
import { useGameState } from '@/lib/stores/useGameState';
import { formatRate } from '@/lib/helpers/formatters';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Define click particle animation
interface ClickParticle {
  id: number;
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
}

export function ClickArea() {
  const { click, currencyPerClick } = useGameState();
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [nextId, setNextId] = useState(0);
  
  // Cleanup particles after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticles(current => current.filter(p => p.id > nextId - 10));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [nextId]);
  
  // Handle the click action
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Get click position relative to the button
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - buttonRect.left;
    const y = e.clientY - buttonRect.top;
    
    // Check for critical click (just for animation purposes)
    const criticalUpgrade = useGameState.getState().clickUpgrades.find(u => u.id === 'critical');
    let isCritical = false;
    
    if (criticalUpgrade && criticalUpgrade.currentLevel > 0) {
      const critChance = criticalUpgrade.getEffect(criticalUpgrade.currentLevel);
      isCritical = Math.random() < critChance;
    }
    
    // Create a new particle
    const newParticle: ClickParticle = {
      id: nextId,
      x,
      y,
      value: currencyPerClick * (isCritical ? 2 : 1),
      isCritical
    };
    
    // Add to particles list
    setParticles(current => [...current, newParticle]);
    setNextId(id => id + 1);
    
    // Perform the game click
    click();
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <p className="text-lg text-gray-300 mb-2">
        <span className="text-yellow-400 font-bold">+{formatRate(currencyPerClick)}</span> per click
      </p>
      
      <Button
        onClick={handleClick}
        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-lg border-4 border-amber-700 flex items-center justify-center text-white text-2xl font-bold transition-transform duration-200 active:scale-95 overflow-hidden"
      >
        CLICK ME!
        
        {/* Click particles */}
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className={`absolute pointer-events-none ${particle.isCritical ? 'text-red-400 font-bold' : 'text-white'}`}
              initial={{ 
                x: particle.x, 
                y: particle.y, 
                scale: particle.isCritical ? 1.5 : 1,
                opacity: 1 
              }}
              animate={{ 
                y: particle.y - 80, 
                opacity: 0,
                scale: particle.isCritical ? 2 : 1.2
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              +{formatRate(particle.value)}
            </motion.div>
          ))}
        </AnimatePresence>
      </Button>
      
      <div className="mt-8 text-center text-gray-400">
        <p>Keep clicking to earn more currency!</p>
        <p>Unlock upgrades to increase your earnings.</p>
      </div>
    </div>
  );
}
