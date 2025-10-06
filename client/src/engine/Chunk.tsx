import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { BlockType } from './blocks';
import { createBlockMesh } from './mesher';
import { generateChunkTerrain } from '../utils/noise';

export interface ChunkProps {
  position: [number, number, number];
  size: { x: number; y: number; z: number };
  voxelData?: Uint8Array;
}

const Chunk: React.FC<ChunkProps> = ({ position, size, voxelData: providedVoxelData }) => {
  const grassTexture = useTexture('/textures/grass.png');
  const asphaltTexture = useTexture('/textures/asphalt.png');
  const woodTexture = useTexture('/textures/wood.jpg');
  const sandTexture = useTexture('/textures/sand.jpg');
  const skyTexture = useTexture('/textures/sky.png');

  // Configure textures
  [grassTexture, asphaltTexture, woodTexture, sandTexture, skyTexture].forEach(texture => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

  const { geometry, materials } = useMemo(() => {
    const voxelData = providedVoxelData || generateChunkTerrain(
      position[0],
      position[1], 
      position[2],
      size.x,
      size.y,
      size.z
    );

    const geo = createBlockMesh(voxelData, size);
    
    // Create materials for different block types
    const mats = [
      new THREE.MeshLambertMaterial({ map: grassTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: asphaltTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: woodTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: sandTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: skyTexture, transparent: true, opacity: 0.8 }),
    ];

    return { geometry: geo, materials: mats };
  }, [position, size, providedVoxelData, grassTexture, asphaltTexture, woodTexture, sandTexture, skyTexture]);

  if (!geometry.attributes.position) {
    return null; // Empty chunk
  }

  return (
    <mesh
      position={position}
      geometry={geometry}
      material={materials[0]} // Use grass material as default
      castShadow
      receiveShadow
    />
  );
};

export default Chunk;
