import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../App';
import { performRaycast } from './raycast';
import { BlockType, getBlockDrops } from './blocks';

const PLAYER_HEIGHT = 1.8;
const PLAYER_SPEED = 5;
const JUMP_FORCE = 8;
const GRAVITY = -20;

interface Inventory {
  slots: (BlockType | null)[];
  counts: number[];
}

const Player: React.FC = () => {
  const { camera, scene } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const velocityRef = useRef(new THREE.Vector3());
  const onGroundRef = useRef(false);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [inventory, setInventory] = useState<Inventory>({
    slots: new Array(36).fill(null),
    counts: new Array(36).fill(0),
  });
  const [targetBlock, setTargetBlock] = useState<{
    position: THREE.Vector3;
    normal: THREE.Vector3;
  } | null>(null);

  // Lock pointer on click
  useEffect(() => {
    const handleClick = () => {
      document.body.requestPointerLock();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle hotbar selection
  useEffect(() => {
    const handleHotbarSelect = (event: CustomEvent) => {
      setSelectedSlot(event.detail);
    };

    window.addEventListener('hotbarSelect', handleHotbarSelect as EventListener);
    return () => window.removeEventListener('hotbarSelect', handleHotbarSelect as EventListener);
  }, []);

  // Mouse look
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

  // Add item to inventory
  const addToInventory = (blockType: BlockType, count: number = 1) => {
    setInventory(prev => {
      const newInventory = { ...prev };
      
      // Try to stack with existing items first
      for (let i = 0; i < newInventory.slots.length; i++) {
        if (newInventory.slots[i] === blockType) {
          newInventory.counts[i] += count;
          return newInventory;
        }
      }
      
      // Find empty slot
      for (let i = 0; i < newInventory.slots.length; i++) {
        if (newInventory.slots[i] === null) {
          newInventory.slots[i] = blockType;
          newInventory.counts[i] = count;
          break;
        }
      }
      
      return newInventory;
    });
  };

  // Player movement and physics
  useFrame((state, delta) => {
    const keys = getKeys();
    const velocity = velocityRef.current;
    
    // Movement
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

    // Jumping
    if (keys.jump && onGroundRef.current) {
      velocity.y = JUMP_FORCE;
      onGroundRef.current = false;
    }

    // Gravity
    velocity.y += GRAVITY * delta;

    // Apply movement
    camera.position.add(velocity.clone().multiplyScalar(delta));

    // Simple ground collision
    if (camera.position.y < PLAYER_HEIGHT + 64) {
      camera.position.y = PLAYER_HEIGHT + 64;
      velocity.y = 0;
      onGroundRef.current = true;
    }

    // Raycast for block interaction
    const raycast = performRaycast(camera.position, camera.getWorldDirection(new THREE.Vector3()), 5);
    setTargetBlock(raycast);

    // Handle mining and placing
    if (keys.mine && raycast) {
      // Mine block
      console.log('Mining block at:', raycast.position);
      // TODO: Remove block from world and add to inventory
      const drops = getBlockDrops(BlockType.GRASS); // Placeholder
      drops.forEach(drop => addToInventory(drop.id, drop.count));
    }

    if (keys.place && raycast) {
      // Place block
      const selectedBlockType = inventory.slots[selectedSlot];
      if (selectedBlockType && inventory.counts[selectedSlot] > 0) {
        console.log('Placing block:', selectedBlockType);
        // TODO: Place block in world
      }
    }
  });

  // Render crosshair and block outline
  return (
    <>
      {/* Block outline */}
      {targetBlock && (
        <mesh position={targetBlock.position}>
          <boxGeometry args={[1.01, 1.01, 1.01]} />
          <meshBasicMaterial color="white" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </>
  );
};

export default Player;
