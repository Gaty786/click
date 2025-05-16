import { create } from 'zustand';
import { getLocalStorage, setLocalStorage } from '../utils';
import { toast } from 'sonner';
import { useAudio } from './useAudio';

// Define upgrade types
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  currentLevel: number;
  baseEffect: number;
  maxLevel?: number;
  unlockCurrency?: number;
  getEffect: (level: number) => number;
  getCost: (level: number) => number;
}

// Define the game state interface
interface GameState {
  // Currency and stats
  currency: number;
  lifetimeCurrency: number;
  lifetimeClicks: number;
  currencyPerClick: number;
  currencyPerSecond: number;
  
  // Upgrades
  clickUpgrades: Upgrade[];
  autoUpgrades: Upgrade[];
  
  // Actions
  click: () => void;
  addClickIncome: (amount: number) => void;
  purchaseUpgrade: (upgradeId: string, type: 'click' | 'auto') => boolean;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;

  // Cheat functions
  addCurrency: (amount: number) => void;
  setUpgradeLevel: (upgradeId: string, type: 'click' | 'auto', level: number) => void;
}

const STORAGE_KEY = 'clickmaster-save';

export const useGameState = create<GameState>((set, get) => ({
  // Initial state
  currency: 0,
  lifetimeCurrency: 0,
  lifetimeClicks: 0,
  currencyPerClick: 1,
  currencyPerSecond: 0,
  
  // Define initial upgrades
  clickUpgrades: [
    {
      id: 'clicker',
      name: 'Better Clicker',
      description: 'Increases currency per click',
      cost: 10,
      currentLevel: 0,
      baseEffect: 1,
      getEffect: (level) => level * 1,
      getCost: (level) => Math.floor(10 * Math.pow(1.5, level)),
    },
    {
      id: 'critical',
      name: 'Critical Clicks',
      description: 'Sometimes clicks give 2x currency',
      cost: 50,
      currentLevel: 0,
      baseEffect: 0.05, // 5% chance per level
      maxLevel: 10,
      unlockCurrency: 50,
      getEffect: (level) => level * 0.05, // Maximum 50% chance at level 10
      getCost: (level) => Math.floor(50 * Math.pow(1.8, level)),
    },
    {
      id: 'multiplier',
      name: 'Click Multiplier',
      description: 'Multiplies all click income',
      cost: 200,
      currentLevel: 0,
      baseEffect: 0.5, // +50% per level
      unlockCurrency: 150,
      getEffect: (level) => 1 + (level * 0.5),
      getCost: (level) => Math.floor(200 * Math.pow(2.2, level)),
    },
  ],
  
  autoUpgrades: [
    {
      id: 'autoclicker',
      name: 'Auto Clicker',
      description: 'Clicks automatically once per second',
      cost: 25,
      currentLevel: 0,
      baseEffect: 0.1,
      getEffect: (level) => level * 0.1,
      getCost: (level) => Math.floor(25 * Math.pow(1.6, level)),
    },
    {
      id: 'farm',
      name: 'Click Farm',
      description: 'Generates clicks at a higher rate',
      cost: 100,
      currentLevel: 0,
      baseEffect: 0.5,
      unlockCurrency: 100,
      getEffect: (level) => level * 0.5,
      getCost: (level) => Math.floor(100 * Math.pow(1.8, level)),
    },
    {
      id: 'factory',
      name: 'Click Factory',
      description: 'Industrial-scale click production',
      cost: 500,
      currentLevel: 0,
      baseEffect: 4,
      unlockCurrency: 300,
      getEffect: (level) => level * 4,
      getCost: (level) => Math.floor(500 * Math.pow(2, level)),
    },
    {
      id: 'mine',
      name: 'Click Mine',
      description: 'Excavates clicks from the depths',
      cost: 3000,
      currentLevel: 0,
      baseEffect: 20,
      unlockCurrency: 1000,
      getEffect: (level) => level * 20,
      getCost: (level) => Math.floor(3000 * Math.pow(2.2, level)),
    },
    {
      id: 'clickverse',
      name: 'Clickverse',
      description: 'Harvests clicks from parallel universes',
      cost: 10000,
      currentLevel: 0,
      baseEffect: 100,
      unlockCurrency: 5000,
      getEffect: (level) => level * 100,
      getCost: (level) => Math.floor(10000 * Math.pow(2.5, level)),
    },
  ],
  
  // Clicking action
  click: () => {
    const state = get();
    const { playHit } = useAudio.getState();
    
    // Determine if critical click (if we have critical click upgrades)
    const criticalUpgrade = state.clickUpgrades.find(u => u.id === 'critical');
    let isCritical = false;
    let criticalMultiplier = 2;
    
    if (criticalUpgrade && criticalUpgrade.currentLevel > 0) {
      const critChance = criticalUpgrade.getEffect(criticalUpgrade.currentLevel);
      isCritical = Math.random() < critChance;
    }
    
    // Calculate base click income
    let clickIncome = state.currencyPerClick;
    
    // Apply critical multiplier if critical hit
    if (isCritical) {
      clickIncome *= criticalMultiplier;
    }
    
    // Play sound
    playHit();
    
    // Update state
    set(state => ({
      currency: state.currency + clickIncome,
      lifetimeCurrency: state.lifetimeCurrency + clickIncome,
      lifetimeClicks: state.lifetimeClicks + 1,
    }));
    
    // If it was a critical hit, show a toast
    if (isCritical) {
      toast('Critical Click!', {
        description: `+${clickIncome.toFixed(1)} currency`,
        position: 'bottom-right',
        duration: 1000,
      });
    }
  },
  
  // Add currency (for automatic generators and cheats)
  addClickIncome: (amount) => {
    if (amount <= 0) return;
    
    set(state => ({
      currency: state.currency + amount,
      lifetimeCurrency: state.lifetimeCurrency + amount,
    }));
  },
  
  // Purchase an upgrade
  purchaseUpgrade: (upgradeId, type) => {
    const { playSuccess } = useAudio.getState();
    
    // Get the appropriate upgrade list
    const upgradesList = type === 'click' ? 'clickUpgrades' : 'autoUpgrades';
    const state = get();
    
    // Find the upgrade
    const upgradeIndex = state[upgradesList].findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return false;
    
    const upgrade = state[upgradesList][upgradeIndex];
    
    // Check if we can upgrade (have enough currency and not at max level)
    const upgradeCost = upgrade.getCost(upgrade.currentLevel);
    
    if (state.currency < upgradeCost) {
      toast.error('Not enough currency!');
      return false;
    }
    
    if (upgrade.maxLevel && upgrade.currentLevel >= upgrade.maxLevel) {
      toast.error('Maximum level reached!');
      return false;
    }
    
    // Perform the upgrade
    const updatedUpgrades = [...state[upgradesList]];
    updatedUpgrades[upgradeIndex] = {
      ...upgrade,
      currentLevel: upgrade.currentLevel + 1,
    };
    
    // Play success sound
    playSuccess();
    
    // Update state
    set(state => {
      // Recalculate per-click and per-second rates
      const newState = {
        ...state,
        currency: state.currency - upgradeCost,
        [upgradesList]: updatedUpgrades,
      };
      
      // Update derived values
      return {
        ...newState,
        currencyPerClick: calculateCurrencyPerClick(newState),
        currencyPerSecond: calculateCurrencyPerSecond(newState),
      };
    });
    
    toast.success(`Upgraded ${upgrade.name} to level ${upgrade.currentLevel + 1}!`);
    return true;
  },
  
  // Save the game state to localStorage
  saveGame: () => {
    const state = get();
    const saveData = {
      currency: state.currency,
      lifetimeCurrency: state.lifetimeCurrency,
      lifetimeClicks: state.lifetimeClicks,
      clickUpgrades: state.clickUpgrades.map(u => ({ id: u.id, level: u.currentLevel })),
      autoUpgrades: state.autoUpgrades.map(u => ({ id: u.id, level: u.currentLevel })),
      timestamp: Date.now(),
    };
    
    setLocalStorage(STORAGE_KEY, saveData);
    
    // Quietly show a toast
    toast('Game saved!', { duration: 1500 });
  },
  
  // Load the game state from localStorage
  loadGame: () => {
    const saveData = getLocalStorage(STORAGE_KEY);
    if (!saveData) return;
    
    // Get upgrades from current state to make sure we have the latest definitions
    const state = get();
    
    // Apply saved upgrade levels
    const updatedClickUpgrades = state.clickUpgrades.map(upgrade => {
      const savedUpgrade = saveData.clickUpgrades.find(u => u.id === upgrade.id);
      return savedUpgrade
        ? { ...upgrade, currentLevel: savedUpgrade.level }
        : upgrade;
    });
    
    const updatedAutoUpgrades = state.autoUpgrades.map(upgrade => {
      const savedUpgrade = saveData.autoUpgrades.find(u => u.id === upgrade.id);
      return savedUpgrade
        ? { ...upgrade, currentLevel: savedUpgrade.level }
        : upgrade;
    });
    
    // Update state with loaded data
    set(state => {
      const newState = {
        ...state,
        currency: saveData.currency || 0,
        lifetimeCurrency: saveData.lifetimeCurrency || 0,
        lifetimeClicks: saveData.lifetimeClicks || 0,
        clickUpgrades: updatedClickUpgrades,
        autoUpgrades: updatedAutoUpgrades,
      };
      
      // Recalculate derived values
      return {
        ...newState,
        currencyPerClick: calculateCurrencyPerClick(newState),
        currencyPerSecond: calculateCurrencyPerSecond(newState),
      };
    });
  },
  
  // Reset the game
  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset the state to initial values
    set(state => {
      // Reset upgrade levels
      const resetClickUpgrades = state.clickUpgrades.map(upgrade => ({
        ...upgrade,
        currentLevel: 0,
      }));
      
      const resetAutoUpgrades = state.autoUpgrades.map(upgrade => ({
        ...upgrade,
        currentLevel: 0,
      }));
      
      return {
        currency: 0,
        lifetimeCurrency: 0,
        lifetimeClicks: 0,
        currencyPerClick: 1,
        currencyPerSecond: 0,
        clickUpgrades: resetClickUpgrades,
        autoUpgrades: resetAutoUpgrades,
      };
    });
    
    toast.success('Game reset!');
  },
  
  // Cheat functions
  addCurrency: (amount) => {
    if (isNaN(amount) || amount <= 0) return;
    
    set(state => ({
      currency: state.currency + amount,
      lifetimeCurrency: state.lifetimeCurrency + amount,
    }));
    
    toast.success(`Added ${amount} currency!`);
  },
  
  setUpgradeLevel: (upgradeId, type, level) => {
    if (isNaN(level) || level < 0) return;
    
    const upgradesList = type === 'click' ? 'clickUpgrades' : 'autoUpgrades';
    
    set(state => {
      const upgrades = [...state[upgradesList]];
      const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      // Check if exceeding max level
      const upgrade = upgrades[upgradeIndex];
      const newLevel = Math.min(level, upgrade.maxLevel || Infinity);
      
      // Update the upgrade level
      upgrades[upgradeIndex] = {
        ...upgrade,
        currentLevel: newLevel,
      };
      
      const newState = {
        ...state,
        [upgradesList]: upgrades,
      };
      
      // Recalculate derived values
      return {
        ...newState,
        currencyPerClick: calculateCurrencyPerClick(newState),
        currencyPerSecond: calculateCurrencyPerSecond(newState),
      };
    });
    
    toast.success(`Set ${upgradeId} to level ${level}!`);
  },
}));

// Helper functions to calculate derived values
function calculateCurrencyPerClick(state: GameState): number {
  // Base click value
  let perClick = 1;
  
  // Add flat bonuses from clicker upgrade
  const clickerUpgrade = state.clickUpgrades.find(u => u.id === 'clicker');
  if (clickerUpgrade && clickerUpgrade.currentLevel > 0) {
    perClick += clickerUpgrade.getEffect(clickerUpgrade.currentLevel);
  }
  
  // Apply multipliers
  const multiplierUpgrade = state.clickUpgrades.find(u => u.id === 'multiplier');
  if (multiplierUpgrade && multiplierUpgrade.currentLevel > 0) {
    perClick *= multiplierUpgrade.getEffect(multiplierUpgrade.currentLevel);
  }
  
  return perClick;
}

function calculateCurrencyPerSecond(state: GameState): number {
  let perSecond = 0;
  
  // Add all auto-upgraders
  state.autoUpgrades.forEach(upgrade => {
    if (upgrade.currentLevel > 0) {
      perSecond += upgrade.getEffect(upgrade.currentLevel);
    }
  });
  
  return perSecond;
}

export type { Upgrade };
