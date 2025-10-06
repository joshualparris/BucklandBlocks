import React from 'react';
import { Play, Settings, Save, FolderOpen, Trash2, Home } from 'lucide-react';
import { hasSave, deleteSave } from '../engine/save';

interface PauseMenuProps {
  onClose: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onClose }) => {
  const handleResume = () => {
    onClose();
  };

  const handleSave = () => {
    // TODO: Trigger world save
    console.log('Saving world...');
    onClose();
  };

  const handleLoad = () => {
    // TODO: Load world from save
    console.log('Loading world...');
    onClose();
  };

  const handleNewWorld = () => {
    if (window.confirm('This will delete your current world. Are you sure?')) {
      deleteSave();
      window.location.reload();
    }
  };

  const handleSettings = () => {
    // TODO: Open settings menu
    console.log('Opening settings...');
  };

  const handleMainMenu = () => {
    // TODO: Return to main menu
    console.log('Returning to main menu...');
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
