import { BlockType } from '../engine/blocks';

// Simple noise function (pseudo-random based on coordinates)
function noise(x: number, z: number, seed: number = 12345): number {
  const n = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Octave noise for more natural terrain
function octaveNoise(x: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

export function generateChunkTerrain(
  chunkX: number,
  chunkY: number,
  chunkZ: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number
): Uint8Array {
  const voxelData = new Uint8Array(sizeX * sizeY * sizeZ);
  
  const baseHeight = 64;
  const heightVariation = 8;

  for (let x = 0; x < sizeX; x++) {
    for (let z = 0; z < sizeZ; z++) {
      const worldX = chunkX + x;
      const worldZ = chunkZ + z;
      
      // Generate height using noise
      const heightNoise = octaveNoise(worldX * 0.01, worldZ * 0.01);
      const terrainHeight = baseHeight + Math.floor(heightNoise * heightVariation);
      
      for (let y = 0; y < sizeY; y++) {
        const worldY = chunkY + y;
        const voxelIndex = x + y * sizeX + z * sizeX * sizeY;
        
        if (worldY < terrainHeight - 3) {
          // Deep underground - stone
          voxelData[voxelIndex] = BlockType.STONE;
        } else if (worldY < terrainHeight - 1) {
          // Shallow underground - dirt
          voxelData[voxelIndex] = BlockType.DIRT;
        } else if (worldY === terrainHeight - 1) {
          // Surface - grass
          voxelData[voxelIndex] = BlockType.GRASS;
        } else {
          // Air
          voxelData[voxelIndex] = BlockType.AIR;
        }
      }
      
      // Add some trees randomly
      if (noise(worldX, worldZ, 54321) > 0.8) {
        const treeHeight = 4 + Math.floor(noise(worldX, worldZ, 98765) * 3);
        for (let treeY = 0; treeY < treeHeight; treeY++) {
          const y = terrainHeight + treeY;
          if (y < chunkY + sizeY) {
            const voxelIndex = x + (y - chunkY) * sizeX + z * sizeX * sizeY;
            if (voxelIndex >= 0 && voxelIndex < voxelData.length) {
              voxelData[voxelIndex] = BlockType.WOOD_LOG;
            }
          }
        }
        
        // Add leaves
        for (let leafY = -2; leafY <= 2; leafY++) {
          for (let leafX = -2; leafX <= 2; leafX++) {
            for (let leafZ = -2; leafZ <= 2; leafZ++) {
              if (Math.abs(leafX) + Math.abs(leafY) + Math.abs(leafZ) <= 3) {
                const y = terrainHeight + treeHeight + leafY;
                const leafWorldX = x + leafX;
                const leafWorldZ = z + leafZ;
                
                if (leafWorldX >= 0 && leafWorldX < sizeX && 
                    leafWorldZ >= 0 && leafWorldZ < sizeZ &&
                    y >= chunkY && y < chunkY + sizeY) {
                  const voxelIndex = leafWorldX + (y - chunkY) * sizeX + leafWorldZ * sizeX * sizeY;
                  if (voxelIndex >= 0 && voxelIndex < voxelData.length) {
                    voxelData[voxelIndex] = BlockType.LEAF;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return voxelData;
}
