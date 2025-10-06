import React from 'react';
import { Play, Settings, Save, FolderOpen, Trash2, Home } from 'lucide-react';
import { useGame } from '../lib/stores/useGame';
import { useThree } from '@react-three/fiber';

interface PauseMenuProps {
  onClose: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onClose }) => {
  const { camera } = useThree();
  const {
    chunks,
    inventory,
    inventoryCounts,
    selectedSlot,
    gameTime,
  } = useGame();

  const handleResume = () => {
    onClose();
  };

  const handleSave = () => {
    try {
      const saveData = {
        playerPosition: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        },
        playerRotation: {
          x: camera.rotation.x,
          y: camera.rotation.y,
        },
        inventory: [...inventory],
        inventoryCounts: [...inventoryCounts],
        selectedSlot,
        gameTime,
        chunks: Array.from(chunks.entries()).map(([key, data]) => ({
          key,
          voxelData: Array.from(data.voxelData),
        })),
        timestamp: Date.now(),
      };
      
      localStorage.setItem('buckland_blocks_save', JSON.stringify(saveData));
      console.log('World saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save world:', error);
      alert('Failed to save world');
    }
  };

  const handleLoad = () => {
    try {
      const savedData = localStorage.getItem('buckland_blocks_save');
      if (savedData) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to load world:', error);
      alert('Failed to load world');
    }
  };

  const handleNewWorld = () => {
    if (window.confirm('This will delete your current world. Are you sure?')) {
      localStorage.removeItem('buckland_blocks_save');
      window.location.reload();
    }
  };

  const handleSettings = () => {
    console.log('Opening settings...');
  };

  const handleMainMenu = () => {
    console.log('Returning to main menu...');
  };

  const hasSave = () => {
    return localStorage.getItem('buckland_blocks_save') !== null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-gray-400 p-6 rounded-lg min-w-[300px]">
        <h2 className="text-white text-2xl font-bold text-center mb-6">Buckland Blocks</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleResume}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            <Play size={20} />
            <span>Resume Game</span>
          </button>

          <button
            onClick={handleSave}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            <Save size={20} />
            <span>Save World</span>
          </button>

          {hasSave() && (
            <button
              onClick={handleLoad}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              <FolderOpen size={20} />
              <span>Load World</span>
            </button>
          )}

          <button
            onClick={handleSettings}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>

          <button
            onClick={handleNewWorld}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
          >
            <Trash2 size={20} />
            <span>New World</span>
          </button>

          <button
            onClick={handleMainMenu}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            <Home size={20} />
            <span>Main Menu</span>
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <div>Press ESC to resume</div>
          <div className="mt-2">Buckland Blocks v1.0</div>
          <div className="text-xs">MIT Licensed - IP Safe</div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
