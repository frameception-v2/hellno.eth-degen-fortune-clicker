"use client";

interface JottokTerminalProps {
  currentFortune: string;
  systemMessage: string;
  upgrades: number;
}

export function JottokTerminal({ currentFortune, systemMessage, upgrades }: JottokTerminalProps) {
  return (
    <div className="mb-4 min-h-[140px] border-2 border-yellow-500 rounded-xl p-4 bg-gray-900 relative">
      <div className="text-base mb-3 text-yellow-500">Degen Terminal v0x{upgrades.toString(16)}</div>
      <div className="font-mono text-yellow-400 text-base md:text-base lg:text-lg">
        {currentFortune || "Click to reveal first secret..."}
      </div>
      
      {systemMessage && (
        <div className="absolute bottom-0 left-0 right-0 bg-black text-yellow-400 p-1 text-xs animate-pulse">
          {systemMessage}
        </div>
      )}
    </div>
  );
}
