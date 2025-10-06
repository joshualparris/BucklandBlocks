import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chunk from './Chunk';
import { BlockType } from './blocks';
import { generateChunkTerrain } from '../utils/noise';
import { fetchOSMData, processOSMData } from '../utils/osm';

interface WorldProps {
  viewDistance?: number;
}

const CHUNK_SIZE = { x: 16, y: 128, z: 16 };
const STARTING_ADDRESS = "53 Buckland Street, Epsom VIC 3551, Australia";

const World: React.FC<WorldProps> = ({ viewDistance = 4 }) => {
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 });
  const [chunks, setChunks] = useState<Map<string, Uint8Array>>(new Map());

  // Fetch OSM data for world generation
  const { data: osmData, isLoading } = useQuery({
    queryKey: ['osmData', STARTING_ADDRESS],
    queryFn: () => fetchOSMData(STARTING_ADDRESS),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Generate chunks around the center
  useEffect(() => {
    const newChunks = new Map<string, Uint8Array>();
    
    for (let x = centerChunk.x - viewDistance; x <= centerChunk.x + viewDistance; x++) {
      for (let z = centerChunk.z - viewDistance; z <= centerChunk.z + viewDistance; z++) {
        const chunkKey = `${x},${z}`;
        
        if (!chunks.has(chunkKey)) {
          // Generate base terrain
          let chunkData = generateChunkTerrain(
            x * CHUNK_SIZE.x,
            0,
            z * CHUNK_SIZE.z,
            CHUNK_SIZE.x,
            CHUNK_SIZE.y,
            CHUNK_SIZE.z
          );

          // Apply OSM data if available
          if (osmData) {
            chunkData = processOSMData(chunkData, osmData, x, z, CHUNK_SIZE);
          }

          newChunks.set(chunkKey, chunkData);
        } else {
          newChunks.set(chunkKey, chunks.get(chunkKey)!);
        }
      }
    }

    setChunks(newChunks);
  }, [centerChunk, viewDistance, osmData, chunks]);

  if (isLoading) {
    return (
      <mesh position={[0, 64, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    );
  }

  const chunkComponents = Array.from(chunks.entries()).map(([key, voxelData]) => {
    const [x, z] = key.split(',').map(Number);
    const chunkPosition: [number, number, number] = [x * CHUNK_SIZE.x, 0, z * CHUNK_SIZE.z];
    
    return (
      <Chunk
        key={key}
        position={chunkPosition}
        size={CHUNK_SIZE}
        voxelData={voxelData}
      />
    );
  });

  return <>{chunkComponents}</>;
};

export default World;
