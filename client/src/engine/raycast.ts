import * as THREE from "three";

export interface RaycastHit {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
}

export function performRaycast(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  maxDistance: number
): RaycastHit | null {
  const raycaster = new THREE.Raycaster(origin, direction.normalize(), 0, maxDistance);
  
  // Simple grid-based raycast for voxel world
  const step = 0.1;
  let currentDistance = 0;
  const currentPos = origin.clone();
  const stepVector = direction.clone().multiplyScalar(step);
  
  while (currentDistance < maxDistance) {
    currentPos.add(stepVector);
    currentDistance += step;
    
    // Check if we hit a solid block (simplified)
    const blockX = Math.floor(currentPos.x);
    const blockY = Math.floor(currentPos.y);
    const blockZ = Math.floor(currentPos.z);
    
    // Simple terrain check - blocks exist at y=64 level
    if (blockY <= 64 && blockY >= 60) {
      const hitPosition = new THREE.Vector3(blockX, blockY, blockZ);
      const normal = new THREE.Vector3(0, 1, 0); // Always up normal for now
      
      return {
        position: hitPosition,
        normal: normal,
        distance: currentDistance,
      };
    }
  }
  
  return null;
}
