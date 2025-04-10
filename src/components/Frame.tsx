"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { 
  INITIAL_UPGRADE_COST,
  UPGRADE_COST_MULTIPLIER,
  CLICK_MULTIPLIER,
  FACTORY_COST,
  FACTORY_PRODUCTION,
  FORTUNE_CHANCE
} from "~/lib/gameConstants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

import { Label } from "~/components/ui/label";
import { useFrameSDK } from "~/hooks/useFrameSDK";

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
  const [factories, setFactories] = useState(0);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [autoClickerInterval, setAutoClickerInterval] = useState<NodeJS.Timeout>();

  // Calculate derived values
  const upgradeCost = useMemo(() => 
    Math.floor(INITIAL_UPGRADE_COST * Math.pow(UPGRADE_COST_MULTIPLIER, upgrades)),
    [upgrades]
  );
  const hatsPerSecond = useMemo(() => 
    factories * FACTORY_PRODUCTION,
    [factories]
  );

  // Auto-clicker effect
  useEffect(() => {
    if (factories > 0) {
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
      setClickMultiplier(prev => prev * CLICK_MULTIPLIER * volatility);
      setVolatility(prev => Math.min(10, prev * 1.2)); // Increase volatility with upgrades
    }
  }, [fortune, upgradeCost, volatility, achievements]);

  const buyFactory = useCallback(() => {
    if (fortune >= FACTORY_COST) {
      setFortune(prev => prev - FACTORY_COST);
      setFactories(prev => prev + 1);
    }
  }, [fortune]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤑 Degen Fortune</CardTitle>
        <CardDescription>
          Each click risks it all for crypto wisdom. Will you HODL or fold?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <Label>Fortune: ${Math.floor(fortune).toLocaleString()}</Label>
          <Label>Upgrades: {upgrades}</Label>
          <Label>Factories: {factories}</Label>
        </div>

        <div className="mb-4 min-h-[80px] border rounded p-2 bg-yellow-50 relative">
          <div className="text-sm mb-1 text-gray-500">Degen Terminal v0x{upgrades.toString(16)}</div>
          <div className="font-mono">
            {currentFortune || "Click to reveal first secret..."}
          </div>
          
          {systemMessage && (
            <div className="absolute bottom-0 left-0 right-0 bg-black text-yellow-400 p-1 text-xs animate-pulse">
              {systemMessage}
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm mb-4">
          <div className="text-red-500">Volatility: {volatility.toFixed(1)}x</div>
          <div>Achievements: {achievements.length}/15</div>
        </div>
        
        <button 
          onClick={handleClick}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-yellow-500 text-black rounded-lg hover:from-red-600 hover:to-yellow-600 transition font-bold"
        >
          REVEAL FORTUNE (+${clickMultiplier})
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={buyUpgrade}
            disabled={fortune < upgradeCost}
            className="p-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Degenerate Wisdom ({upgradeCost.toLocaleString()} $DEGEN)
          </button>
          
          <button
            onClick={buyFactory}
            disabled={fortune < FACTORY_COST}
            className="p-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Oracle Node ({FACTORY_COST.toLocaleString()} $DEGEN)
          </button>
        </div>

        <div className="text-center text-sm">
          <Label>Production: {hatsPerSecond}/sec</Label>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const { isSDKLoaded } = useFrameSDK();

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-2 px-2">
      <GameStats />
    </div>
  );
}
