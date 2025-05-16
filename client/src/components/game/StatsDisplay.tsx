import { formatCurrency, formatRate } from '@/lib/helpers/formatters';
import { useGameState } from '@/lib/stores/useGameState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function StatsDisplay() {
  const { 
    currency, 
    lifetimeCurrency, 
    lifetimeClicks, 
    currencyPerClick, 
    currencyPerSecond 
  } = useGameState();
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-yellow-400">Stats</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatItem 
            title="Current Currency" 
            value={formatCurrency(currency)} 
            icon="💰"
          />
          
          <StatItem 
            title="Lifetime Currency" 
            value={formatCurrency(lifetimeCurrency)} 
            icon="📈"
          />
          
          <StatItem 
            title="Total Clicks" 
            value={formatCurrency(lifetimeClicks)} 
            icon="👆"
          />
          
          <StatItem 
            title="Per Click" 
            value={formatRate(currencyPerClick)} 
            icon="🔨"
          />
          
          <StatItem 
            title="Per Second" 
            value={formatRate(currencyPerSecond)} 
            icon="⏱️"
          />
          
          <StatItem 
            title="Efficiency" 
            value={currencyPerSecond > 0 ? `${(currencyPerSecond / currencyPerClick).toFixed(1)}x` : "0x"}
            icon="⚡"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatItemProps {
  title: string;
  value: string;
  icon: string;
}

function StatItem({ title, value, icon }: StatItemProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-1">
        <span className="mr-1">{icon}</span>
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
