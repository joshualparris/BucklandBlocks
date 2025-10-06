import { BlockType } from './blocks';

export interface ChunkData {
  x: number;
  z: number;
  voxelData: Uint8Array;
  timestamp: number;
}

export interface InventoryData {
  slots: (BlockType | null)[];
  counts: number[];
  selectedSlot: number;
}

export interface WorldSave {
  chunks: ChunkData[];
  inventory: InventoryData;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: { x: number; y: number };
  gameTime: number;
}

const SAVE_KEY = 'buckland_blocks_save';

export function saveWorld(worldData: WorldSave): void {
  try {
    const serializedData = JSON.stringify({
      ...worldData,
      chunks: worldData.chunks.map(chunk => ({
        ...chunk,
        voxelData: Array.from(chunk.voxelData), // Convert Uint8Array to regular array for JSON
      })),
    });
    localStorage.setItem(SAVE_KEY, serializedData);
    console.log('World saved successfully');
  } catch (error) {
    console.error('Failed to save world:', error);
  }
}

export function loadWorld(): WorldSave | null {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;

    const parsedData = JSON.parse(savedData);
    
    // Convert array back to Uint8Array
    const worldData: WorldSave = {
      ...parsedData,
      chunks: parsedData.chunks.map((chunk: any) => ({
        ...chunk,
        voxelData: new Uint8Array(chunk.voxelData),
      })),
    };

    console.log('World loaded successfully');
    return worldData;
  } catch (error) {
    console.error('Failed to load world:', error);
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
  console.log('Save deleted');
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

// Save only dirty chunks (chunks that have been modified)
export function saveChunkData(chunkX: number, chunkZ: number, voxelData: Uint8Array): void {
  const existingSave = loadWorld() || createNewSave();
  
  // Update or add the chunk
  const chunkIndex = existingSave.chunks.findIndex(
    chunk => chunk.x === chunkX && chunk.z === chunkZ
  );
  
  const chunkData: ChunkData = {
    x: chunkX,
    z: chunkZ,
    voxelData,
    timestamp: Date.now(),
  };
  
  if (chunkIndex >= 0) {
    existingSave.chunks[chunkIndex] = chunkData;
  } else {
    existingSave.chunks.push(chunkData);
  }
  
  saveWorld(existingSave);
}

function createNewSave(): WorldSave {
  return {
    chunks: [],
    inventory: {
      slots: new Array(36).fill(null),
      counts: new Array(36).fill(0),
      selectedSlot: 0,
    },
    playerPosition: { x: 0, y: 70, z: 0 },
    playerRotation: { x: 0, y: 0 },
    gameTime: 0,
  };
}
