import { useEffect } from "react";
import { Toaster } from "sonner";
import { ClickArea } from "./components/game/ClickArea";
import { UpgradeSection } from "./components/game/UpgradeSection";
import { CheatConsole } from "./components/game/CheatConsole";
import { Currency } from "./components/game/Currency";
import { StatsDisplay } from "./components/game/StatsDisplay";
import { useGameState } from "./lib/stores/useGameState";
import { useCheatStore } from "./lib/stores/useCheatStore";
import { useAudio } from "./lib/stores/useAudio";

function App() {
  const { 
    loadGame, 
    saveGame, 
    addClickIncome,
    currencyPerSecond 
  } = useGameState();
  
  const { isCheatConsoleOpen } = useCheatStore();

  // Create and load audio elements
  useEffect(() => {
    // Load the click sound
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.2;
    
    // Load the upgrade purchase sound
    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.3;
    
    // Load background music (optional)
    const backgroundMusic = new Audio("/sounds/background.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.1;
    
    // Set up the sounds in the store
    useAudio.getState().setHitSound(hitSound);
    useAudio.getState().setSuccessSound(successSound);
    useAudio.getState().setBackgroundMusic(backgroundMusic);
    
    return () => {
      // Clean up sounds
      hitSound.pause();
      successSound.pause();
      backgroundMusic.pause();
    };
  }, []);

  // Load saved game on initial mount
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Save game every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame();
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [saveGame]);

  // Passive income implementation
  useEffect(() => {
    if (currencyPerSecond <= 0) return;
    
    // Update currency 20 times per second for smoother animations
    const updateInterval = setInterval(() => {
      addClickIncome(currencyPerSecond / 20);
    }, 50);
    
    return () => clearInterval(updateInterval);
  }, [currencyPerSecond, addClickIncome]);

  // Handle keydown events for the cheat code
  useEffect(() => {
    const { handleKeyPress } = useCheatStore.getState();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-yellow-400 tracking-tight">ClickMaster</h1>
          <p className="text-gray-300 text-lg">Click to earn, upgrade to prosper!</p>
          <Currency />
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <UpgradeSection />
          </div>
          
          <div className="lg:col-span-2 order-1 lg:order-2">
            <ClickArea />
            <div className="mt-6">
              <StatsDisplay />
            </div>
          </div>
        </div>
        
        {/* Cheat Console */}
        {isCheatConsoleOpen && <CheatConsole />}
        
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

export default App;
