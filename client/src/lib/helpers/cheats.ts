import { toast } from 'sonner';
import { useGameState } from '../stores/useGameState';

// Help information
const HELP_TEXT = `
Available commands:
- help: Show this help information
- money <amount>: Add specified amount of currency
- upgrade <type> <id> <level>: Set upgrade level
- reset: Reset the game
- list upgrades: List all available upgrades
- debug: Show all upgrade details in console
- close: Close the cheat console
`;

// Execute a cheat command
export function executeCheatCommand(commandStr: string): void {
  const args = commandStr.toLowerCase().trim().split(/\s+/);
  const command = args[0];
  
  const gameState = useGameState.getState();
  
  switch (command) {
    case 'help':
      toast.info('Help Information', {
        description: HELP_TEXT,
        duration: 10000,
      });
      break;
      
    case 'money':
    case 'cash':
    case 'currency':
      const amount = parseFloat(args[1]);
      if (isNaN(amount)) {
        toast.error('Invalid amount. Usage: money <amount>');
        return;
      }
      
      gameState.addCurrency(amount);
      break;
      
    case 'upgrade':
      // upgrade <type> <id> <level>
      if (args.length < 4) {
        toast.error('Invalid command. Usage: upgrade <type> <id> <level>');
        return;
      }
      
      const upgradeType = args[1] === 'click' ? 'click' : 'auto';
      const upgradeId = args[2];
      const level = parseInt(args[3]);
      
      const validUpgrades = upgradeType === 'click' 
        ? gameState.clickUpgrades.map(u => u.id) 
        : gameState.autoUpgrades.map(u => u.id);
        
      if (!validUpgrades.includes(upgradeId)) {
        toast.error(`Invalid upgrade ID. Valid IDs for ${upgradeType}: ${validUpgrades.join(', ')}`);
        return;
      }
      
      gameState.setUpgradeLevel(upgradeId, upgradeType, level);
      break;
      
    case 'reset':
      if (confirm('Are you sure you want to reset the game?')) {
        gameState.resetGame();
      }
      break;
      
    case 'list':
      if (args[1] === 'upgrades') {
        const clickUpgrades = gameState.clickUpgrades.map(u => `${u.id} (${u.name})`).join(', ');
        const autoUpgrades = gameState.autoUpgrades.map(u => `${u.id} (${u.name})`).join(', ');
        
        toast.info('Available Upgrades', {
          description: `Click Upgrades: ${clickUpgrades}\n\nAuto Upgrades: ${autoUpgrades}`,
          duration: 10000,
        });
      } else {
        toast.error('Invalid list command. Try "list upgrades"');
      }
      break;
      
    case 'debug':
      // Log all upgrade details to console
      console.log('== CLICK UPGRADES ==');
      gameState.clickUpgrades.forEach(upgrade => {
        console.log(`ID: ${upgrade.id}`);
        console.log(`Name: ${upgrade.name}`);
        console.log(`Description: ${upgrade.description}`);
        console.log(`Level: ${upgrade.currentLevel}`);
        console.log(`Base Effect: ${upgrade.baseEffect}`);
        console.log(`Max Level: ${upgrade.maxLevel || 'Unlimited'}`);
        console.log(`Unlock at: ${upgrade.unlockCurrency || 'Available from start'}`);
        console.log('-------------------');
      });
      
      console.log('== AUTO UPGRADES ==');
      gameState.autoUpgrades.forEach(upgrade => {
        console.log(`ID: ${upgrade.id}`);
        console.log(`Name: ${upgrade.name}`);
        console.log(`Description: ${upgrade.description}`);
        console.log(`Level: ${upgrade.currentLevel}`);
        console.log(`Base Effect: ${upgrade.baseEffect}`);
        console.log(`Max Level: ${upgrade.maxLevel || 'Unlimited'}`);
        console.log(`Unlock at: ${upgrade.unlockCurrency || 'Available from start'}`);
        console.log('-------------------');
      });
      
      toast.success('Upgrade details sent to console', {
        description: 'Press F12 or open browser developer tools to view',
        duration: 5000,
      });
      break;
      
    case 'max':
      // max <type> - maxes out all upgrades of a type
      if (args.length < 2) {
        toast.error('Invalid command. Usage: max <type>');
        return;
      }
      
      const type = args[1];
      if (type === 'click' || type === 'all') {
        gameState.clickUpgrades.forEach(upgrade => {
          const maxLevel = upgrade.maxLevel || 100;
          gameState.setUpgradeLevel(upgrade.id, 'click', maxLevel);
        });
      }
      
      if (type === 'auto' || type === 'all') {
        gameState.autoUpgrades.forEach(upgrade => {
          const maxLevel = upgrade.maxLevel || 100;
          gameState.setUpgradeLevel(upgrade.id, 'auto', maxLevel);
        });
      }
      
      if (type !== 'click' && type !== 'auto' && type !== 'all') {
        toast.error('Invalid type. Use "click", "auto", or "all"');
      }
      break;
      
    case 'close':
      // This will be handled by the CheatConsole component
      break;
      
    default:
      toast.error(`Unknown command: ${command}`, {
        description: 'Type "help" to see available commands',
      });
  }
}
