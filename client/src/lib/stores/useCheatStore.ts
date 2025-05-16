import { create } from 'zustand';
import { toast } from 'sonner';
import { executeCheatCommand } from '../helpers/cheats';

interface CheatState {
  secretCode: string;
  secretInput: string[];
  isCheatConsoleOpen: boolean;
  commandHistory: string[];
  currentCommand: string;
  
  // Actions
  handleKeyPress: (key: string) => void;
  resetSecretInput: () => void;
  setCurrentCommand: (command: string) => void;
  executeCommand: () => void;
  closeConsole: () => void;
}

// Secret code to trigger cheat console
const SECRET_CODE = 'gaty';

export const useCheatStore = create<CheatState>((set, get) => ({
  secretCode: SECRET_CODE,
  secretInput: [],
  isCheatConsoleOpen: false,
  commandHistory: [],
  currentCommand: '',
  
  handleKeyPress: (key) => {
    // If console is already open, don't track secret code
    if (get().isCheatConsoleOpen) return;
    
    const secretInput = [...get().secretInput, key];
    
    // Keep only the last N characters where N is the length of the secret code
    if (secretInput.length > SECRET_CODE.length) {
      secretInput.shift();
    }
    
    set({ secretInput });
    
    // Check if secret code has been entered
    const inputString = secretInput.join('');
    if (inputString.toLowerCase() === SECRET_CODE.toLowerCase()) {
      set({ 
        isCheatConsoleOpen: true,
        secretInput: []
      });
      
      toast('Cheat console activated!', {
        description: 'Type "help" to see available commands',
        position: 'bottom-center',
        duration: 3000,
      });
    }
  },
  
  resetSecretInput: () => {
    set({ secretInput: [] });
  },
  
  setCurrentCommand: (command) => {
    set({ currentCommand: command });
  },
  
  executeCommand: () => {
    const { currentCommand, commandHistory } = get();
    
    if (!currentCommand.trim()) return;
    
    // Add to history
    const newHistory = [...commandHistory, currentCommand];
    
    // Execute the command
    executeCheatCommand(currentCommand);
    
    // Reset current command and update history
    set({ 
      currentCommand: '',
      commandHistory: newHistory
    });
  },
  
  closeConsole: () => {
    set({ isCheatConsoleOpen: false });
  }
}));
