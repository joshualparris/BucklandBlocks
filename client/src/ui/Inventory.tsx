import React from 'react';
import { X } from 'lucide-react';
import { BlockType, BLOCKS } from '../engine/blocks';

interface InventoryProps {
  onClose: () => void;
  inventory?: (BlockType | null)[];
  inventoryCounts?: number[];
}

const Inventory: React.FC<InventoryProps> = ({ 
  onClose,
  inventory = new Array(36).fill(null),
  inventoryCounts = new Array(36).fill(0)
}) => {
  const handleSlotClick = (slotIndex: number) => {
    // TODO: Handle slot interactions (move items, split stacks, etc.)
    console.log('Clicked inventory slot:', slotIndex);
  };

  const renderSlot = (slotIndex: number, isHotbar: boolean = false) => {
    const blockType = inventory[slotIndex];
    const count = inventoryCounts[slotIndex];
    
    return (
      <div
        key={slotIndex}
        className={`w-12 h-12 border-2 border-gray-400 bg-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 ${
          isHotbar ? 'border-yellow-400' : ''
        }`}
        onClick={() => handleSlotClick(slotIndex)}
      >
        {blockType !== null && blockType !== BlockType.AIR && (
          <>
            <div className="text-white text-[8px] font-bold text-center">
              {BLOCKS[blockType].name.slice(0, 4)}
            </div>
            {count > 0 && (
              <div className="text-white text-[10px]">{count}</div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-gray-400 p-4 rounded-lg min-w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-bold">Inventory</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main inventory grid (3x9 = 27 slots) */}
        <div className="mb-4">
          <div className="grid grid-cols-9 gap-1 mb-2">
            {Array.from({ length: 27 }, (_, i) => renderSlot(i + 9))}
          </div>
        </div>

        {/* Hotbar (9 slots) */}
        <div className="border-t border-gray-600 pt-2">
          <div className="grid grid-cols-9 gap-1">
            {Array.from({ length: 9 }, (_, i) => renderSlot(i, true))}
          </div>
        </div>

        <div className="mt-4 text-center text-gray-400 text-sm">
          Press E to close
        </div>
      </div>
    </div>
  );
};

export default Inventory;
