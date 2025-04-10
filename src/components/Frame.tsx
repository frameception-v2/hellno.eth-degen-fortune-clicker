"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { 
  INITIAL_UPGRADE_COST,
  UPGRADE_COST_MULTIPLIER,
  CLICK_MULTIPLIER,
  FORTUNE_CHANCE,
  FACTORY_TYPES
} from "~/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

import { Label } from "~/components/ui/label";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { JottokTerminal } from "~/components/JottokTerminal";

const DEGEN_TIPS = [
  "When in doubt, leverage up",
  "The real alpha is always in the DMs",
  "If TVL is dropping, print more governance tokens",
  "Rugpulls are just unregistered ICOs",
  "The best time to ape was yesterday. Second best is now",
  "If chart going up, it's a bull market. If down, accumulation phase",
  "Your seed phrase is: pizza salad burger... just kidding",
  "Moon farming requires 125x leverage and diamond hands",
  "The real risk management is having multiple metamask wallets",
  "If CEX reserves are low, it's just proof of community HODLing",
  "Smart contracts can't be hacked if you never verify them",
  "The only KYC you need is 'Know Your Cex'",
  "Liquidity is someone else's problem - be the exit",
  "Flash loans are just free money experiments"
];

const CRYPTIC_EVENTS = [
  { text: "You discover a secret Satoshi tweetstorm... (+500% multiplier!)", multiplier: 5 },
  { text: "The SEC raids your metamask... (Lost 50% fortune!)", multiplier: -0.5 },
  { text: "Vitalik retweets your memecoin... (2x production!)", effect: "2x" },
  { text: "Celsius unlocks your assets... (Refund 20%!)", effect: "refund" },
  { text: "You front-run a whale transaction... (+300% but volatility up!)", multiplier: 3, volatility: 2 },
  { text: "The merge completes early... All gains 10x!", multiplier: 10 },
  { text: "Binance lists your shitcoin... (Production 5x!)", effect: "5x" },
  { text: "Tether collapses... (Everything -90%!)", multiplier: 0.1 },
  { text: "You discover a quantum-resistant algorithm... (Immunity next 3 events)", effect: "immunity" },
  { text: "Anonymous donates their Bitcoin stash... (+777%)", multiplier: 7.77 }
];

function GameStats() {
  const [fortune, setFortune] = useState(0);
  const [lore, setLore] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [volatility, setVolatility] = useState(1);
  const [systemMessage, setSystemMessage] = useState("");
  const [currentFortune, setCurrentFortune] = useState("");
  const [upgrades, setUpgrades] = useState(0);
  const [factories, setFactories] = useState([0, 0, 0]);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [autoClickerInterval, setAutoClickerInterval] = useState<NodeJS.Timeout>();

  // Calculate derived values
  const upgradeCost = useMemo(() => 
    Math.floor(INITIAL_UPGRADE_COST * Math.pow(UPGRADE_COST_MULTIPLIER, upgrades)),
    [upgrades]
  );
  const hatsPerSecond = useMemo(() => 
    factories.reduce((total, count, index) => 
      total + count * FACTORY_TYPES[index].production, 0),
    [factories]
  );

  // Auto-clicker effect
  useEffect(() => {
    if (factories.some(f => f > 0)) {
      const interval = setInterval(() => {
        setFortune(prev => prev + hatsPerSecond);
      }, 1000);
      setAutoClickerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [factories, hatsPerSecond]);

  const handleClick = useCallback(() => {
    // Base click with risk multiplier
    let baseFortune = clickMultiplier;
    const fortuneEvent = CRYPTIC_EVENTS[Math.floor(Math.random() * CRYPTIC_EVENTS.length)];
    
    // Random crypto event
    if (Math.random() < FORTUNE_CHANCE) {
      setCurrentFortune(fortuneEvent.text);
      if (fortuneEvent.multiplier) {
        baseFortune *= fortuneEvent.multiplier;
      }
      if (fortuneEvent.effect === '2x') {
        setUpgrades(prev => prev + 1);
      }
    } else {
      setCurrentFortune(DEGEN_TIPS[Math.floor(Math.random() * DEGEN_TIPS.length)]);
    }
    
    // Check for secret achievements
    const newAchievements: string[] = [];
    if (baseFortune < 0 && !achievements.includes("Liquidation Wizard")) {
      newAchievements.push("Liquidation Wizard");
    }
    if (fortune >= 1000000 && !achievements.includes("Whale Watching")) {
      newAchievements.push("Whale Watching");
    }
    if (upgrades >= 10 && !achievements.includes("Ultra Degen")) {
      newAchievements.push("Ultra Degen");
    }
    if (lore.length > 50 && !achievements.includes("Lore Master")) {
      newAchievements.push("Lore Master");
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setSystemMessage(`ACHIEVEMENT UNLOCKED: ${newAchievements.join(", ")}`);
      setTimeout(() => setSystemMessage(""), 5000);
    }

    // Update volatility based on events
    if (fortuneEvent.volatility) {
      setVolatility(prev => Math.min(10, prev + fortuneEvent.volatility));
    }
    
    setFortune(prev => Math.max(0, prev + Math.floor(baseFortune)));
    setLore(prev => [...prev.slice(-4), currentFortune]);
  }, [clickMultiplier, currentFortune, achievements, fortune, lore.length, upgrades]);

  const buyUpgrade = useCallback(() => {
    if (fortune >= upgradeCost) {
      setFortune(prev => prev - upgradeCost);
      setUpgrades(prev => {
        const newLevel = prev + 1;
        // Every 5 upgrades unlocks a new tier
        if (newLevel % 5 === 0 && !achievements.includes(`Tier ${newLevel/5} Degen`)) {
          setAchievements(prev => [...prev, `Tier ${newLevel/5} Degen`]);
          setSystemMessage(`UNLOCKED TIER ${newLevel/5} DEGENERACY!`);
          setTimeout(() => setSystemMessage(""), 5000);
        }
        return newLevel;
      });
      setClickMultiplier(prev => prev + (CLICK_MULTIPLIER * Math.sqrt(volatility)));
      setVolatility(prev => Math.min(10, prev * 1.2)); // Increase volatility with upgrades
    }
  }, [fortune, upgradeCost, volatility, achievements]);

  const buyFactory = useCallback((factoryIndex: number) => {
    const factoryType = FACTORY_TYPES[factoryIndex];
    const factoryCost = Math.floor(factoryType.baseCost * Math.pow(1.15, factories[factoryIndex]));
    if (fortune >= factoryCost) {
      setFortune(prev => prev - factoryCost);
      setFactories(prev => {
        const newFactories = [...prev];
        newFactories[factoryIndex] += 1;
        return newFactories;
      });
    }
  }, [fortune, factories]);

  return (
    <>
      <Card className="h-full flex flex-col bg-opacity-90 bg-gray-800 border-yellow-500 shadow-lg min-h-[calc(100vh-32px)]">
        <CardHeader>
        <CardTitle>🤑 Degen Fortune</CardTitle>
        <CardDescription>
          Each click risks it all for crypto wisdom. Will you HODL or fold?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow space-y-6 p-4 md:p-6">
        <div className="flex justify-between">
          <Label>Fortune: ${Math.floor(fortune).toLocaleString()}</Label>
          <Label>Upgrades: {upgrades}</Label>
          <Label>Factories: {factories}</Label>
        </div>

        <div className="relative w-full">
          {Array.from({ length: Math.min(hatsPerSecond, 100) }).map((_, i) => (
            <div
              key={i}
              className="absolute -inset-0 animate-orbit"
              style={{
                animationDelay: `${(i % 10) * 0.5}s`,
                transform: `rotate(${(i * 360) / Math.min(hatsPerSecond, 100)}deg) translateX(50px) translateY(50px)`,
              }}
            >
              <div className="absolute animate-spin">
                🎩
              </div>
            </div>
          ))}
          <button 
            onClick={handleClick}
            className="relative w-full py-6 md:py-8 bg-gradient-to-r from-red-500 to-yellow-500 text-black rounded-full hover:from-red-600 hover:to-yellow-600 transition-all font-bold flex flex-col items-center gap-3 text-xl md:text-2xl z-10"
          >
          <div className="text-5xl md:text-6xl animate-bounce">🎩</div>
          <div>COLLECT</div>
          <div className="text-base md:text-lg">+{clickMultiplier.toFixed(1)}× DEGEN</div>
        </button>
        </div>

        <JottokTerminal 
          currentFortune={currentFortune}
          systemMessage={systemMessage}
          upgrades={upgrades}
        />

        <div className="flex justify-between text-sm mb-4">
          <div className="text-red-500">Volatility: {volatility.toFixed(1)}x</div>
          <div>Achievements: {achievements.length}/15</div>
        </div>
        

        <div className="grid grid-cols-1 gap-3 mb-6">
          <button
            onClick={buyUpgrade}
            disabled={fortune < upgradeCost}
            className="p-3 md:p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50 text-base md:text-lg transition-colors"
          >
            🧠 Degenerate Wisdom ({upgradeCost.toLocaleString()} $DEGEN)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {FACTORY_TYPES.map((factory, index) => {
            const count = factories[index];
            const cost = Math.floor(factory.baseCost * Math.pow(1.15, count));
            return (
              <button
                key={factory.name}
                onClick={() => buyFactory(index)}
                disabled={fortune < cost}
                className="p-3 md:p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 text-sm md:text-base transition-colors flex flex-col items-center gap-1"
              >
                <div className="text-lg">{factory.emoji}</div>
                <div>{factory.name}</div>
                <div className="text-xs opacity-75 mt-1">
                  {cost.toLocaleString()} $DEGEN
                </div>
                <div className="text-xs opacity-75">
                  ({count} owned)
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center text-sm">
          <Label>Production Breakdown:</Label>
          <div className="text-xs space-y-1 mt-1">
            {FACTORY_TYPES.map((factory, index) => (
              <div key={factory.name}>
                {factory.emoji} {factory.name}: {factories[index] * factory.production}/sec
              </div>
            ))}
          </div>
          <Label className="mt-2 block">Total Production: {hatsPerSecond}/sec</Label>
        </div>
      </CardContent>
    </Card>
    <style>{`
      @keyframes orbit {
        from {
          transform: rotate(0deg) translateX(50px) translateY(50px);
        }
        to {
          transform: rotate(360deg) translateX(50px) translateY(50px);
        }
      }
      .animate-orbit {
        animation: orbit 8s linear infinite;
      }
      .animate-spin {
        animation: spin 2s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    </>
  );
}

export default function Frame() {
  const { isSDKLoaded } = useFrameSDK();

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <div className="flex-1 w-full mx-auto max-w-4xl h-full px-2 md:px-4">
        <GameStats />
      </div>
    </div>
  );
}
