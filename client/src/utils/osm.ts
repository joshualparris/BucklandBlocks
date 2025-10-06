import { BlockType } from '../engine/blocks';

export interface OSMData {
  buildings: Array<{
    id: string;
    geometry: Array<[number, number]>; // lat, lon coordinates
    tags: Record<string, string>;
  }>;
  roads: Array<{
    id: string;
    geometry: Array<[number, number]>;
    tags: Record<string, string>;
  }>;
  center: { lat: number; lon: number };
}

export async function fetchOSMData(address: string): Promise<OSMData | null> {
  try {
    // First geocode the address
    const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!geocodeResponse.ok) {
      throw new Error('Failed to geocode address');
    }
    
    const geocodeData = await geocodeResponse.json();
    const { lat, lon } = geocodeData;

    // Then fetch OSM footprints
    const footprintsResponse = await fetch(
      `/api/footprints?lat=${lat}&lon=${lon}&radius=300`
    );
    if (!footprintsResponse.ok) {
      throw new Error('Failed to fetch OSM footprints');
    }

    const footprintsData = await footprintsResponse.json();
    
    return {
      center: { lat, lon },
      buildings: footprintsData.buildings || [],
      roads: footprintsData.roads || [],
    };
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    return null;
  }
}

export function processOSMData(
  chunkData: Uint8Array,
  osmData: OSMData,
  chunkX: number,
  chunkZ: number,
  chunkSize: { x: number; y: number; z: number }
): Uint8Array {
  const processedData = new Uint8Array(chunkData);
  
  // Convert lat/lon to world coordinates (simplified projection)
  // This is a rough approximation for the local area
  const scale = 100000; // Adjust scale as needed
  const centerX = 0;
  const centerZ = 0;

  // Process buildings
  osmData.buildings.forEach(building => {
    // Convert building footprint to voxel coordinates
    const voxelCoords = building.geometry.map(([lat, lon]) => {
      const x = Math.floor((lon - osmData.center.lon) * scale);
      const z = Math.floor((lat - osmData.center.lat) * scale);
      return { x, z };
    });

    // Check if building intersects with this chunk
    const chunkMinX = chunkX * chunkSize.x;
    const chunkMaxX = chunkMinX + chunkSize.x;
    const chunkMinZ = chunkZ * chunkSize.z;
    const chunkMaxZ = chunkMinZ + chunkSize.z;

    const intersects = voxelCoords.some(coord => 
      coord.x >= chunkMinX && coord.x < chunkMaxX &&
      coord.z >= chunkMinZ && coord.z < chunkMaxZ
    );

    if (intersects) {
      // Stamp building into chunk
      stampBuilding(processedData, voxelCoords, chunkX, chunkZ, chunkSize, building.tags);
    }
  });

  // Process roads
  osmData.roads.forEach(road => {
    const voxelCoords = road.geometry.map(([lat, lon]) => {
      const x = Math.floor((lon - osmData.center.lon) * scale);
      const z = Math.floor((lat - osmData.center.lat) * scale);
      return { x, z };
    });

    // Stamp road into chunk
    stampRoad(processedData, voxelCoords, chunkX, chunkZ, chunkSize);
  });

  return processedData;
}

function stampBuilding(
  chunkData: Uint8Array,
  footprint: Array<{ x: number; z: number }>,
  chunkX: number,
  chunkZ: number,
  chunkSize: { x: number; y: number; z: number },
  tags: Record<string, string>
): void {
  // Simple rectangular building for now
  if (footprint.length < 3) return;

  const minX = Math.min(...footprint.map(p => p.x));
  const maxX = Math.max(...footprint.map(p => p.x));
  const minZ = Math.min(...footprint.map(p => p.z));
  const maxZ = Math.max(...footprint.map(p => p.z));

  const buildingHeight = tags.building === 'house' ? 3 : 5;
  const wallBlock = BlockType.BRICK;
  const roofBlock = BlockType.WOOD_PLANK;

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      const localX = x - chunkX * chunkSize.x;
      const localZ = z - chunkZ * chunkSize.z;
      
      if (localX >= 0 && localX < chunkSize.x && localZ >= 0 && localZ < chunkSize.z) {
        // Build walls
        for (let y = 64; y < 64 + buildingHeight; y++) {
          const localY = y;
          if (localY >= 0 && localY < chunkSize.y) {
            const isWall = x === minX || x === maxX || z === minZ || z === maxZ;
            const voxelIndex = localX + localY * chunkSize.x + localZ * chunkSize.x * chunkSize.y;
            
            if (voxelIndex >= 0 && voxelIndex < chunkData.length) {
              if (isWall) {
                chunkData[voxelIndex] = wallBlock;
              } else if (y === 64 + buildingHeight - 1) {
                // Roof
                chunkData[voxelIndex] = roofBlock;
              }
            }
          }
        }
      }
    }
  }
}

function stampRoad(
  chunkData: Uint8Array,
  roadPoints: Array<{ x: number; z: number }>,
  chunkX: number,
  chunkZ: number,
  chunkSize: { x: number; y: number; z: number }
): void {
  // Simple road rendering - just place asphalt blocks at ground level
  roadPoints.forEach(point => {
    const localX = point.x - chunkX * chunkSize.x;
    const localZ = point.z - chunkZ * chunkSize.z;
    
    if (localX >= 0 && localX < chunkSize.x && localZ >= 0 && localZ < chunkSize.z) {
      // Place road blocks in a 3x3 area around each point
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const roadX = localX + dx;
          const roadZ = localZ + dz;
          
          if (roadX >= 0 && roadX < chunkSize.x && roadZ >= 0 && roadZ < chunkSize.z) {
            const y = 64; // Ground level
            const voxelIndex = roadX + y * chunkSize.x + roadZ * chunkSize.x * chunkSize.y;
            
            if (voxelIndex >= 0 && voxelIndex < chunkData.length) {
              chunkData[voxelIndex] = BlockType.COBBLESTONE;
            }
          }
        }
      }
    }
  });
}
