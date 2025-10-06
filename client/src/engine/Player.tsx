import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../App';
import { performRaycast } from './raycast';
import { BlockType, getBlockDrops, isBlockSolid } from './blocks';
import { useGame } from '../lib/stores/useGame';

const PLAYER_HEIGHT = 1.8;
const PLAYER_SPEED = 5;
const JUMP_FORCE = 8;
const GRAVITY = -20;

const Player: React.FC = () => {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const {
    selectedSlot,
    setSelectedSlot,
    inventory,
    inventoryCounts,
    addToInventory,
    removeFromInventory,
    setBlock,
    getBlock,
    markChunkDirty
  } = useGame();
  
  const velocityRef = useRef(new THREE.Vector3());
  const onGroundRef = useRef(false);
  const targetBlockRef = useRef<{
    position: THREE.Vector3;
    normal: THREE.Vector3;
    blockType: BlockType;
  } | null>(null);
  
  const miningTimeRef = useRef(0);
  const lastMineRef = useRef(0);

  useEffect(() => {
    const handleClick = () => {
      document.body.requestPointerLock();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const handleHotbarSelect = (event: CustomEvent) => {
      setSelectedSlot(event.detail);
    };

    window.addEventListener('hotbarSelect', handleHotbarSelect as EventListener);
    return () => window.removeEventListener('hotbarSelect', handleHotbarSelect as EventListener);
  }, [setSelectedSlot]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== document.body) return;

      const sensitivity = 0.002;
      camera.rotation.y -= event.movementX * sensitivity;
      camera.rotation.x -= event.movementY * sensitivity;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [camera]);

  useFrame((state, delta) => {
    const keys = getKeys();
    const velocity = velocityRef.current;
    
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    forward.y = 0;
    forward.normalize();
    right.y = 0;
    right.normalize();

    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.rightward) direction.add(right);
    if (keys.leftward) direction.sub(right);

    direction.normalize();
    direction.multiplyScalar(PLAYER_SPEED);

    velocity.x = direction.x;
    velocity.z = direction.z;

    if (keys.jump && onGroundRef.current) {
      velocity.y = JUMP_FORCE;
      onGroundRef.current = false;
    }

    velocity.y += GRAVITY * delta;
    camera.position.add(velocity.clone().multiplyScalar(delta));

    const groundY = 64;
    const blockBelow = getBlock(
      Math.floor(camera.position.x),
      Math.floor(camera.position.y - PLAYER_HEIGHT),
      Math.floor(camera.position.z)
    );

    if (isBlockSolid(blockBelow)) {
      const surfaceY = Math.floor(camera.position.y - PLAYER_HEIGHT) + 1 + PLAYER_HEIGHT;
      if (camera.position.y < surfaceY) {
        camera.position.y = surfaceY;
        velocity.y = 0;
        onGroundRef.current = true;
      }
    } else if (camera.position.y < PLAYER_HEIGHT + groundY) {
      camera.position.y = PLAYER_HEIGHT + groundY;
      velocity.y = 0;
      onGroundRef.current = true;
    }

    const raycast = performRaycast(
      camera.position,
      camera.getWorldDirection(new THREE.Vector3()),
      5,
      getBlock
    );
    targetBlockRef.current = raycast;

    const now = Date.now();
    
    if (keys.mine && raycast && now - lastMineRef.current > 200) {
      lastMineRef.current = now;
      
      const { x, y, z } = raycast.position;
      const blockType = raycast.blockType;
      
      console.log(`Mining block at ${x}, ${y}, ${z}: ${blockType}`);
      
      setBlock(Math.floor(x), Math.floor(y), Math.floor(z), BlockType.AIR);
      
      const chunkX = Math.floor(Math.floor(x) / 16);
      const chunkZ = Math.floor(Math.floor(z) / 16);
      markChunkDirty(chunkX, chunkZ);
      
      const drops = getBlockDrops(blockType);
      drops.forEach(drop => addToInventory(drop.id, drop.count));
    }

    if (keys.place && raycast && now - lastMineRef.current > 200) {
      const selectedBlockType = inventory[selectedSlot];
      if (selectedBlockType && inventoryCounts[selectedSlot] > 0) {
        lastMineRef.current = now;
        
        const placePos = raycast.position.clone().add(raycast.normal);
        const { x, y, z } = placePos;
        
        const playerBox = new THREE.Box3(
          new THREE.Vector3(camera.position.x - 0.3, camera.position.y - PLAYER_HEIGHT, camera.position.z - 0.3),
          new THREE.Vector3(camera.position.x + 0.3, camera.position.y + 0.3, camera.position.z + 0.3)
        );
        
        const blockBox = new THREE.Box3(
          new THREE.Vector3(Math.floor(x), Math.floor(y), Math.floor(z)),
          new THREE.Vector3(Math.floor(x) + 1, Math.floor(y) + 1, Math.floor(z) + 1)
        );
        
        if (!playerBox.intersectsBox(blockBox)) {
          console.log(`Placing block at ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}: ${selectedBlockType}`);
          
          setBlock(Math.floor(x), Math.floor(y), Math.floor(z), selectedBlockType);
          
          const chunkX = Math.floor(Math.floor(x) / 16);
          const chunkZ = Math.floor(Math.floor(z) / 16);
          markChunkDirty(chunkX, chunkZ);
          
          removeFromInventory(selectedSlot, 1);
        }
      }
    }
  });

  return (
    <>
      {targetBlockRef.current && (
        <mesh position={targetBlockRef.current.position}>
          <boxGeometry args={[1.01, 1.01, 1.01]} />
          <meshBasicMaterial color="white" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </>
  );
};

export default Player;
