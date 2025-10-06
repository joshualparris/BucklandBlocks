import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BlockType, BLOCKS } from '../engine/blocks';
import recipes from '../data/recipes.json';

interface CraftingProps {
  onClose: () => void;
  inventory?: (BlockType | null)[];
  inventoryCounts?: number[];
}

interface Recipe {
  id: string;
  result: { type: BlockType; count: number };
  ingredients: Array<{ type: BlockType; count: number }>;
  pattern: string[];
}

const Crafting: React.FC<CraftingProps> = ({ 
  onClose,
  inventory = new Array(36).fill(null),
  inventoryCounts = new Array(36).fill(0)
}) => {
  const [craftingGrid, setCraftingGrid] = useState<(BlockType | null)[]>(new Array(4).fill(null));
  const [craftingCounts, setCraftingCounts] = useState<number[]>(new Array(4).fill(0));
  const [craftResult, setCraftResult] = useState<{ type: BlockType; count: number } | null>(null);

  // Check if a recipe matches the current crafting grid
  const findMatchingRecipe = (): Recipe | null => {
    for (const recipe of recipes as Recipe[]) {
      if (recipe.pattern.length === 2) { // 2x2 recipe
        let matches = true;
        
        for (let i = 0; i < 4; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          const patternChar = recipe.pattern[row]?.[col];
          const requiredType = patternChar ? recipe.ingredients.find(ing => 
            ing.type === (patternChar === 'L' ? BlockType.WOOD_LOG : 
                         patternChar === 'P' ? BlockType.WOOD_PLANK :
                         patternChar === 'S' ? BlockType.STONE :
                         patternChar === 'C' ? BlockType.COBBLESTONE : BlockType.AIR)
          )?.type : null;
          
          if (craftingGrid[i] !== requiredType) {
            matches = false;
            break;
          }
        }
        
        if (matches) return recipe;
      }
    }
    return null;
  };

  // Update craft result when grid changes
  React.useEffect(() => {
    const recipe = findMatchingRecipe();
    setCraftResult(recipe ? recipe.result : null);
  }, [craftingGrid, craftingCounts]);

  const handleCraftingSlotClick = (slotIndex: number) => {
    // TODO: Handle crafting grid interactions
    console.log('Clicked crafting slot:', slotIndex);
  };

  const handleCraftButtonClick = () => {
    if (craftResult) {
      // TODO: Perform crafting - remove ingredients and add result to inventory
      console.log('Crafting:', craftResult);
      // Clear crafting grid
      setCraftingGrid(new Array(4).fill(null));
      setCraftingCounts(new Array(4).fill(0));
    }
  };

  const renderCraftingSlot = (slotIndex: number) => {
    const blockType = craftingGrid[slotIndex];
    const count = craftingCounts[slotIndex];
    
    return (
      <div
        key={slotIndex}
        className="w-12 h-12 border-2 border-gray-400 bg-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600"
        onClick={() => handleCraftingSlotClick(slotIndex)}
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

  const renderResultSlot = () => {
    if (!craftResult) return <div className="w-12 h-12 border-2 border-gray-400 bg-gray-700" />;
    
    return (
      <div
        className="w-12 h-12 border-2 border-yellow-400 bg-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600"
        onClick={handleCraftButtonClick}
      >
        <div className="text-white text-[8px] font-bold text-center">
          {BLOCKS[craftResult.type].name.slice(0, 4)}
        </div>
        <div className="text-white text-[10px]">{craftResult.count}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-gray-400 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-bold">Crafting</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {/* 2x2 Crafting Grid */}
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 4 }, (_, i) => renderCraftingSlot(i))}
          </div>

          {/* Arrow */}
          <div className="text-white text-2xl">→</div>

          {/* Result Slot */}
          {renderResultSlot()}
        </div>

        {/* Recipe List */}
        <div className="border-t border-gray-600 pt-4">
          <h3 className="text-white font-bold mb-2">Available Recipes:</h3>
          <div className="text-gray-300 text-sm space-y-1 max-h-32 overflow-y-auto">
            {(recipes as Recipe[]).map((recipe, index) => (
              <div key={index} className="flex justify-between">
                <span>{BLOCKS[recipe.result.type].name}</span>
                <span>({recipe.result.count}x)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-gray-400 text-sm">
          Press C to close
        </div>
      </div>
    </div>
  );
};

export default Crafting;
