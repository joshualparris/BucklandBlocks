import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chunk from './Chunk';
import { generateChunkTerrain } from '../utils/noise';
import { fetchOSMData, processOSMData } from '../utils/osm';
import { useGame } from '../lib/stores/useGame';

interface WorldProps {
  viewDistance?: number;
}

const CHUNK_SIZE = { x: 16, y: 128, z: 16 };
const STARTING_ADDRESS = "53 Buckland Street, Epsom VIC 3551, Australia";

const World: React.FC<WorldProps> = ({ viewDistance = 4 }) => {
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 });
  const { setChunk, getChunk } = useGame();

  // Fetch OSM data for world generation
  const { data: osmData, isLoading } = useQuery({
    queryKey: ['osmData', STARTING_ADDRESS],
    queryFn: () => fetchOSMData(STARTING_ADDRESS),
    staleTime: 10 * 60 * 1000,
  });

  // Track which chunks we've rendered
  const [renderedChunks, setRenderedChunks] = useState<Set<string>>(new Set());

  // Generate chunks around the center
  useEffect(() => {
    const newRenderedChunks = new Set<string>();
    
    for (let x = centerChunk.x - viewDistance; x <= centerChunk.x + viewDistance; x++) {
      for (let z = centerChunk.z - viewDistance; z <= centerChunk.z + viewDistance; z++) {
        const chunkKey = `${x},${z}`;
        newRenderedChunks.add(chunkKey);
        
        const existingChunk = getChunk(x, z);
        if (!existingChunk) {
          let chunkData = generateChunkTerrain(
            x * CHUNK_SIZE.x,
            0,
            z * CHUNK_SIZE.z,
            CHUNK_SIZE.x,
            CHUNK_SIZE.y,
            CHUNK_SIZE.z
          );

          if (osmData) {
            chunkData = processOSMData(chunkData, osmData, x, z, CHUNK_SIZE);
          }

          setChunk(x, z, chunkData);
        }
      }
    }

    setRenderedChunks(newRenderedChunks);
  }, [centerChunk, viewDistance, osmData]);

  if (isLoading) {
    return (
      <mesh position={[0, 64, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    );
  }

  const chunkComponents = Array.from(renderedChunks).map((key) => {
    const [x, z] = key.split(',').map(Number);
    const chunkPosition: [number, number, number] = [x * CHUNK_SIZE.x, 0, z * CHUNK_SIZE.z];
    
    return (
      <Chunk
        key={key}
        chunkX={x}
        chunkZ={z}
        position={chunkPosition}
        size={CHUNK_SIZE}
      />
    );
  });

  return <>{chunkComponents}</>;
};

export default World;
