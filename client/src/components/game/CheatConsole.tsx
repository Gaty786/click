import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCheatStore } from '@/lib/stores/useCheatStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function CheatConsole() {
  const { 
    currentCommand, 
    setCurrentCommand, 
    executeCommand, 
    closeConsole, 
    commandHistory 
  } = useCheatStore();
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto focus input when console opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Handle escape key to close console
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeConsole();
      } else if (e.key === 'Enter') {
        executeCommand();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeConsole, executeCommand]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
    >
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="bg-gray-800 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-yellow-400">Cheat Console</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={closeConsole}
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="bg-gray-950 p-3 rounded-md mb-4 h-48 overflow-y-auto text-sm font-mono">
            <div className="text-green-400 mb-2">Welcome to the cheat console! Type 'help' for commands.</div>
            
            {commandHistory.map((cmd, i) => (
              <div key={i} className="mb-1">
                <span className="text-yellow-500">&gt; </span>
                <span className="text-gray-300">{cmd}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              placeholder="Enter command..."
              className="bg-gray-800 border-gray-600 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeCommand();
                }
              }}
            />
            <Button 
              onClick={executeCommand}
              className="bg-yellow-600 hover:bg-yellow-500 text-white"
            >
              Enter
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            Type "help" for a list of available commands.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
