import { useState } from 'react';
import { useGameState, type Upgrade } from '@/lib/stores/useGameState';
import { formatCurrency } from '@/lib/helpers/formatters';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

export function UpgradeSection() {
  const { clickUpgrades, autoUpgrades, currency, lifetimeCurrency, purchaseUpgrade } = useGameState();
  const [activeTab, setActiveTab] = useState<'click' | 'auto'>('click');
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-yellow-400">Upgrades</CardTitle>
        <CardDescription>Improve your clicking power</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="click" onValueChange={(v) => setActiveTab(v as 'click' | 'auto')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="click">Click Upgrades</TabsTrigger>
            <TabsTrigger value="auto">Auto Upgrades</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="click" className="space-y-4">
              {clickUpgrades.map(upgrade => (
                <UpgradeItem 
                  key={upgrade.id}
                  upgrade={upgrade}
                  currency={currency}
                  lifetimeCurrency={lifetimeCurrency}
                  onPurchase={() => purchaseUpgrade(upgrade.id, 'click')}
                  type="click"
                />
              ))}
            </TabsContent>
            
            <TabsContent value="auto" className="space-y-4">
              {autoUpgrades.map(upgrade => (
                <UpgradeItem 
                  key={upgrade.id}
                  upgrade={upgrade}
                  currency={currency}
                  lifetimeCurrency={lifetimeCurrency}
                  onPurchase={() => purchaseUpgrade(upgrade.id, 'auto')}
                  type="auto"
                />
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface UpgradeItemProps {
  upgrade: Upgrade;
  currency: number;
  lifetimeCurrency: number;
  onPurchase: () => void;
  type: 'click' | 'auto';
}

function UpgradeItem({ upgrade, currency, lifetimeCurrency, onPurchase, type }: UpgradeItemProps) {
  const cost = upgrade.getCost(upgrade.currentLevel);
  const nextEffect = upgrade.getEffect(upgrade.currentLevel + 1);
  const currentEffect = upgrade.getEffect(upgrade.currentLevel);
  
  // Check if locked (requires certain lifetime currency)
  const isLocked = upgrade.unlockCurrency && lifetimeCurrency < upgrade.unlockCurrency;
  // Is max level?
  const isMaxed = upgrade.maxLevel && upgrade.currentLevel >= upgrade.maxLevel;
  // Can afford?
  const canAfford = currency >= cost && !isLocked && !isMaxed;
  
  // Format the effect description
  let effectDescription = '';
  if (type === 'click') {
    if (upgrade.id === 'clicker') {
      effectDescription = `+${nextEffect.toFixed(1)} per click`;
    } else if (upgrade.id === 'critical') {
      effectDescription = `${(nextEffect * 100).toFixed(0)}% chance for critical clicks`;
    } else if (upgrade.id === 'multiplier') {
      effectDescription = `${nextEffect.toFixed(1)}x click multiplier`;
    }
  } else {
    effectDescription = `+${nextEffect.toFixed(1)} per second`;
  }
  
  if (isLocked) {
    return (
      <Card className="bg-gray-900 border-gray-700 opacity-80">
        <CardHeader className="py-3">
          <CardTitle className="text-base text-gray-400">??? Locked Upgrade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Requires {formatCurrency(upgrade.unlockCurrency || 0)} lifetime currency to unlock
          </p>
          <Progress 
            value={(lifetimeCurrency / (upgrade.unlockCurrency || 1)) * 100} 
            className="h-2 mt-2" 
          />
        </CardContent>
      </Card>
    );
  }
  
  if (isMaxed) {
    return (
      <Card className="bg-amber-900/20 border-amber-700/50">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex justify-between items-center">
            <span>{upgrade.name}</span>
            <span className="text-amber-400">MAX LEVEL</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">{upgrade.description}</p>
          <p className="text-xs text-amber-400 mt-1">
            Current effect: {type === 'click' ? 
              `${upgrade.id === 'critical' ? `${(currentEffect * 100).toFixed(0)}% critical chance` : 
               upgrade.id === 'multiplier' ? `${currentEffect.toFixed(1)}x multiplier` :
               `+${currentEffect.toFixed(1)} per click`}` : 
              `+${currentEffect.toFixed(1)} per second`}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div whileHover={{ scale: canAfford ? 1.02 : 1 }} transition={{ duration: 0.2 }}>
      <Card className={`${canAfford ? 'bg-gray-700 border-gray-600 cursor-pointer' : 'bg-gray-800 border-gray-700'}`}>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex justify-between items-center">
            <span>{upgrade.name}</span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">Level {upgrade.currentLevel}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-300">{upgrade.description}</p>
          {upgrade.currentLevel > 0 && (
            <p className="text-xs text-yellow-400 mt-1">
              Current effect: {type === 'click' ? 
                `${upgrade.id === 'critical' ? `${(currentEffect * 100).toFixed(0)}% critical chance` : 
                 upgrade.id === 'multiplier' ? `${currentEffect.toFixed(1)}x multiplier` :
                 `+${currentEffect.toFixed(1)} per click`}` : 
                `+${currentEffect.toFixed(1)} per second`}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between">
          <span className="text-xs text-gray-400">Next: {effectDescription}</span>
          <Button 
            onClick={onPurchase} 
            disabled={!canAfford}
            variant={canAfford ? "default" : "outline"} 
            size="sm"
            className={canAfford ? "bg-yellow-600 hover:bg-yellow-500" : ""}
          >
            {formatCurrency(cost)}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
