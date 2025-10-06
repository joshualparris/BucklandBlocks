import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { createBlockMesh } from './mesher';
import { useGame } from '../lib/stores/useGame';

export interface ChunkProps {
  chunkX: number;
  chunkZ: number;
  position: [number, number, number];
  size: { x: number; y: number; z: number };
}

const Chunk: React.FC<ChunkProps> = ({ chunkX, chunkZ, position, size }) => {
  const grassTexture = useTexture('/textures/grass.png');
  const asphaltTexture = useTexture('/textures/asphalt.png');
  const woodTexture = useTexture('/textures/wood.jpg');
  const sandTexture = useTexture('/textures/sand.jpg');
  const skyTexture = useTexture('/textures/sky.png');

  const chunks = useGame(state => state.chunks);
  const chunkKey = `${chunkX},${chunkZ}`;
  const chunkData = chunks.get(chunkKey);
  const voxelData = chunkData?.voxelData;
  const isDirty = chunkData?.dirty || false;

  [grassTexture, asphaltTexture, woodTexture, sandTexture, skyTexture].forEach(texture => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

  const { geometry, materials } = useMemo(() => {
    if (!voxelData) {
      return { geometry: new THREE.BufferGeometry(), materials: [] };
    }

    const geo = createBlockMesh(voxelData, size);
    
    const mats = [
      new THREE.MeshLambertMaterial({ map: grassTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: asphaltTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: woodTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: sandTexture, transparent: false }),
      new THREE.MeshLambertMaterial({ map: skyTexture, transparent: true, opacity: 0.8 }),
    ];

    if (chunkData && isDirty) {
      chunkData.dirty = false;
    }

    return { geometry: geo, materials: mats };
  }, [chunks, chunkX, chunkZ, size, grassTexture, asphaltTexture, woodTexture, sandTexture, skyTexture]);

  if (!geometry.attributes.position) {
    return null;
  }

  return (
    <mesh
      position={position}
      geometry={geometry}
      material={materials[0]}
      castShadow
      receiveShadow
    />
  );
};

export default Chunk;
