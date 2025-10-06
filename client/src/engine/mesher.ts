import * as THREE from "three";
import { BlockType, isBlockTransparent } from "./blocks";

export interface MeshData {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

const FACE_INDICES = [
  [0, 1, 2, 0, 2, 3], // Front
  [4, 7, 6, 4, 6, 5], // Back
  [8, 9, 10, 8, 10, 11], // Right
  [12, 15, 14, 12, 14, 13], // Left
  [16, 17, 18, 16, 18, 19], // Top
  [20, 23, 22, 20, 22, 21], // Bottom
];

const FACE_NORMALS = [
  [0, 0, 1],   // Front
  [0, 0, -1],  // Back
  [1, 0, 0],   // Right
  [-1, 0, 0],  // Left
  [0, 1, 0],   // Top
  [0, -1, 0],  // Bottom
];

export function createBlockMesh(
  voxelData: Uint8Array,
  chunkSize: { x: number; y: number; z: number }
): THREE.BufferGeometry {
  const meshData: MeshData = {
    positions: [],
    normals: [],
    uvs: [],
    indices: [],
  };

  let vertexIndex = 0;

  for (let x = 0; x < chunkSize.x; x++) {
    for (let y = 0; y < chunkSize.y; y++) {
      for (let z = 0; z < chunkSize.z; z++) {
        const blockIndex = x + y * chunkSize.x + z * chunkSize.x * chunkSize.y;
        const blockType = voxelData[blockIndex];

        if (blockType === BlockType.AIR) continue;

        // Check each face
        const faces = [
          { x: x, y: y, z: z + 1 }, // Front
          { x: x, y: y, z: z - 1 }, // Back
          { x: x + 1, y: y, z: z }, // Right
          { x: x - 1, y: y, z: z }, // Left
          { x: x, y: y + 1, z: z }, // Top
          { x: x, y: y - 1, z: z }, // Bottom
        ];

        faces.forEach((face, faceIndex) => {
          const shouldRenderFace = 
            face.x < 0 || face.x >= chunkSize.x ||
            face.y < 0 || face.y >= chunkSize.y ||
            face.z < 0 || face.z >= chunkSize.z ||
            isBlockTransparent(getVoxelAt(voxelData, chunkSize, face.x, face.y, face.z));

          if (shouldRenderFace) {
            addBlockFace(meshData, x, y, z, faceIndex, vertexIndex);
            vertexIndex += 4;
          }
        });
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  
  if (meshData.positions.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(meshData.uvs, 2));
    geometry.setIndex(meshData.indices);
  }

  return geometry;
}

function getVoxelAt(
  voxelData: Uint8Array,
  chunkSize: { x: number; y: number; z: number },
  x: number,
  y: number,
  z: number
): BlockType {
  if (x < 0 || x >= chunkSize.x || y < 0 || y >= chunkSize.y || z < 0 || z >= chunkSize.z) {
    return BlockType.AIR;
  }
  const index = x + y * chunkSize.x + z * chunkSize.x * chunkSize.y;
  return voxelData[index];
}

function addBlockFace(
  meshData: MeshData,
  x: number,
  y: number,
  z: number,
  faceIndex: number,
  vertexIndex: number
): void {
  const facePositions = getFacePositions(x, y, z, faceIndex);
  const faceNormal = FACE_NORMALS[faceIndex];
  const faceUVs = [0, 0, 1, 0, 1, 1, 0, 1]; // Simple UV mapping

  // Add positions
  meshData.positions.push(...facePositions);
  
  // Add normals
  for (let i = 0; i < 4; i++) {
    meshData.normals.push(...faceNormal);
  }
  
  // Add UVs
  meshData.uvs.push(...faceUVs);
  
  // Add indices
  const indices = FACE_INDICES[faceIndex].map(i => i + vertexIndex);
  meshData.indices.push(...indices);
}

function getFacePositions(x: number, y: number, z: number, faceIndex: number): number[] {
  const positions = [
    // Front face
    [
      x, y, z + 1,
      x + 1, y, z + 1,
      x + 1, y + 1, z + 1,
      x, y + 1, z + 1
    ],
    // Back face
    [
      x + 1, y, z,
      x, y, z,
      x, y + 1, z,
      x + 1, y + 1, z
    ],
    // Right face
    [
      x + 1, y, z + 1,
      x + 1, y, z,
      x + 1, y + 1, z,
      x + 1, y + 1, z + 1
    ],
    // Left face
    [
      x, y, z,
      x, y, z + 1,
      x, y + 1, z + 1,
      x, y + 1, z
    ],
    // Top face
    [
      x, y + 1, z + 1,
      x + 1, y + 1, z + 1,
      x + 1, y + 1, z,
      x, y + 1, z
    ],
    // Bottom face
    [
      x, y, z,
      x + 1, y, z,
      x + 1, y, z + 1,
      x, y, z + 1
    ],
  ];

  return positions[faceIndex];
}
