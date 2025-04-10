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

function GameStats() {
  const [hats, setHats] = useState(0);
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
        setHats(prev => prev + hatsPerSecond);
      }, 1000);
      setAutoClickerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [factories, hatsPerSecond]);

  const handleClick = useCallback(() => {
    // Base click with multiplier
    let baseHats = clickMultiplier;
    
    // Random fortune bonus
    if (Math.random() < FORTUNE_CHANCE) {
      baseHats *= 2;
    }
    
    setHats(prev => prev + baseHats);
  }, [clickMultiplier]);

  const buyUpgrade = useCallback(() => {
    if (hats >= upgradeCost) {
      setHats(prev => prev - upgradeCost);
      setUpgrades(prev => prev + 1);
      setClickMultiplier(prev => prev * CLICK_MULTIPLIER);
    }
  }, [hats, upgradeCost]);

  const buyFactory = useCallback(() => {
    if (hats >= FACTORY_COST) {
      setHats(prev => prev - FACTORY_COST);
      setFactories(prev => prev + 1);
    }
  }, [hats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎩 Hat Factory</CardTitle>
        <CardDescription>
          Click to make hats! Upgrade your production chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <Label>Hats: {Math.floor(hats).toLocaleString()}</Label>
          <Label>Upgrades: {upgrades}</Label>
          <Label>Factories: {factories}</Label>
        </div>

        <button 
          onClick={handleClick}
          className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          CLICK TO MAKE HATS (+{clickMultiplier})
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={buyUpgrade}
            disabled={hats < upgradeCost}
            className="p-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Buy Upgrade ({upgradeCost.toLocaleString()} hats)
          </button>
          
          <button
            onClick={buyFactory}
            disabled={hats < FACTORY_COST}
            className="p-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Buy Factory ({FACTORY_COST.toLocaleString()} hats)
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
