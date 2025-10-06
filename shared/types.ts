export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ChunkCoordinate {
  x: number;
  z: number;
}

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export interface InventorySlot {
  blockType: number | null;
  count: number;
}

export interface GameSettings {
  renderDistance: number;
  fov: number;
  mouseSensitivity: number;
  soundEnabled: boolean;
  showDebugInfo: boolean;
}

export interface SavedChunk {
  x: number;
  z: number;
  voxelData: number[];
  lastModified: number;
}

export interface WorldSaveData {
  playerPosition: Vector3;
  playerRotation: { x: number; y: number };
  inventory: InventorySlot[];
  selectedSlot: number;
  gameTime: number;
  chunks: SavedChunk[];
  worldSeed: number;
  version: string;
}

export interface OSMBuilding {
  id: string;
  geometry: Array<[number, number]>; // [lat, lon] pairs
  tags: Record<string, string>;
  height?: number;
}

export interface OSMRoad {
  id: string;
  geometry: Array<[number, number]>; // [lat, lon] pairs
  tags: Record<string, string>;
  width?: number;
}

export interface GeocodeResponse {
  lat: number;
  lon: number;
  display_name: string;
}

export interface FootprintsResponse {
  buildings: OSMBuilding[];
  roads: OSMRoad[];
}
