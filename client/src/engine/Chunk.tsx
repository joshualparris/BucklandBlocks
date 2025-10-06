import React, { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { createBlockMesh } from "./mesher";
import { useGame } from "../lib/stores/useGame";

export interface ChunkProps {
  chunkX: number;
  chunkZ: number;
  position: [number, number, number];
  size: { x: number; y: number; z: number };
}

const Chunk: React.FC<ChunkProps> = ({ chunkX, chunkZ, position, size }) => {
  const textures = useTexture({
    grass: "/textures/grass.png",
    dirt: "/textures/dirt.png",
    stone: "/textures/stone.png",
    wood: "/textures/wood.jpg",
    sand: "/textures/sand.jpg",
    sky: "/textures/sky.png",
  });

  // crisp voxel look + correct color space
  Object.values(textures).forEach((t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    // r3f/three@0.15+ uses colorSpace
    (t as any).colorSpace = THREE.SRGBColorSpace;
  });

  const chunks = useGame((s) => s.chunks);
  const chunkKey = `${chunkX},${chunkZ}`;
  const chunkData = chunks.get(chunkKey);
  const voxelData = chunkData?.voxelData;

  if (!voxelData) return null;

  const { geometry, materials } = useMemo(() => {
  const geo = createBlockMesh(voxelData, size);
    // normals for proper lighting
    geo.computeVertexNormals();

    const mats: THREE.Material[] = [
      new THREE.MeshStandardMaterial({ map: textures.dirt, roughness: 0.9, metalness: 0 }),
      new THREE.MeshStandardMaterial({ map: textures.grass, roughness: 0.8, metalness: 0 }),
      new THREE.MeshStandardMaterial({ map: textures.stone, roughness: 0.7, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: textures.wood, roughness: 0.8, metalness: 0 }),
      new THREE.MeshStandardMaterial({ map: textures.sand, roughness: 0.9, metalness: 0 }),
      new THREE.MeshStandardMaterial({
        map: textures.sky,
        roughness: 0.1,
        metalness: 0,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      }),
    ];

    if (chunkData?.dirty) chunkData.dirty = false;
    return { geometry: geo, materials: mats };
  }, [voxelData, size, textures.grass, textures.wood, textures.sand, textures.sky, chunkData]);

  return (
    <mesh
      position={position}
      geometry={geometry}
      // IMPORTANT: pass the whole array so geometry.groups use the right material index
      material={materials}
      // turn shadows OFF for perf for now
      castShadow={false}
      receiveShadow={false}
    />
  );
};

export default Chunk;
