import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useGame } from "./lib/stores/useGame";
import World from "./engine/World";
import Player from "./engine/Player";
import DayNightCycle from "./engine/DayNightCycle";
import GameHUD from "./ui/GameHUD";
import Inventory from "./ui/Inventory";
import Crafting from "./ui/Crafting";
import PauseMenu from "./ui/PauseMenu";
import "@fontsource/inter";

// Define control keys for the game
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  sneak = 'sneak',
  mine = 'mine',
  place = 'place',
}

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.jump, keys: ["Space"] },
  { name: Controls.sneak, keys: ["ShiftLeft", "ShiftRight"] },
  { name: Controls.mine, keys: ["Mouse0"] },
  { name: Controls.place, keys: ["Mouse2"] },
];

function App() {
  const { phase } = useGame();
  const [showCanvas, setShowCanvas] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showPause, setShowPause] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyE':
          setShowInventory(!showInventory);
          break;
        case 'KeyC':
          setShowCrafting(!showCrafting);
          break;
        case 'Escape':
          setShowPause(!showPause);
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          // Handle hotbar selection
          const slot = parseInt(event.code.slice(-1)) - 1;
          window.dispatchEvent(new CustomEvent('hotbarSelect', { detail: slot }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInventory, showCrafting, showPause]);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{
              position: [0, 70, 0],
              fov: 75,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance"
            }}
          >
            <Suspense fallback={null}>
              <DayNightCycle />
              <World />
              <Player />
            </Suspense>
          </Canvas>
          
          <GameHUD />
          
          {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
          {showCrafting && <Crafting onClose={() => setShowCrafting(false)} />}
          {showPause && <PauseMenu onClose={() => setShowPause(false)} />}
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
