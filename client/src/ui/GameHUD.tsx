import React, { useState, useEffect } from 'react';
import { BlockType, BLOCKS } from '../engine/blocks';

interface GameHUDProps {
  selectedSlot?: number;
  inventory?: (BlockType | null)[];
  inventoryCounts?: number[];
}

const GameHUD: React.FC<GameHUDProps> = ({ 
  selectedSlot = 0, 
  inventory = new Array(9).fill(BlockType.DIRT),
  inventoryCounts = new Array(9).fill(64)
}) => {
  const [fps, setFps] = useState(60);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 70, z: 0 });
  const [gameTime, setGameTime] = useState(0);

  // Simple FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
  }, []);

  // Game time (day/night cycle)
  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(time => (time + 1) % 24000); // 20 minute day cycle
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = Math.floor((gameTime / 1000) % 24);
  const isNight = timeOfDay >= 18 || timeOfDay < 6;

  return (
    <div className="fixed inset-0 pointer-events-none select-none">
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-white opacity-75">
          <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-white transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* HUD Info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded font-mono text-sm">
        <div>FPS: {fps}</div>
        <div>XYZ: {coordinates.x.toFixed(1)}, {coordinates.y.toFixed(1)}, {coordinates.z.toFixed(1)}</div>
        <div>Time: {timeOfDay}:00 {isNight ? '🌙' : '☀️'}</div>
        <div>Biome: Temperate</div>
      </div>

      {/* Controls Help */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded font-mono text-xs">
        <div>WASD: Move</div>
        <div>Mouse: Look</div>
        <div>Space: Jump</div>
        <div>LMB: Mine</div>
        <div>RMB: Place</div>
        <div>E: Inventory</div>
        <div>C: Crafting</div>
        <div>ESC: Pause</div>
        <div>1-9: Hotbar</div>
      </div>

      {/* Hotbar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1 bg-black bg-opacity-75 p-2 rounded">
          {Array.from({ length: 9 }, (_, i) => {
            const blockType = inventory[i];
            const count = inventoryCounts[i];
            const isSelected = i === selectedSlot;
            
            return (
              <div
                key={i}
                className={`w-12 h-12 border-2 flex flex-col items-center justify-center text-white text-xs ${
                  isSelected ? 'border-white bg-gray-700' : 'border-gray-500 bg-gray-800'
                }`}
              >
                {blockType !== null && blockType !== BlockType.AIR && (
                  <>
                    <div className="text-[8px] font-bold">
                      {BLOCKS[blockType].name.slice(0, 3)}
                    </div>
                    <div className="text-[10px]">{count > 0 ? count : ''}</div>
                  </>
                )}
                <div className="absolute bottom-0 right-0 text-[8px] text-gray-400">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
