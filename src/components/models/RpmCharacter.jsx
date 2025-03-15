import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RpmDirectModel } from './RpmDirectModel';

export function RpmCharacter({ client, position }) {
  const characterRef = useRef();
  const [isMoving, setIsMoving] = useState(false);

  // Basic movement controls
  useFrame((state, delta) => {
    if (!characterRef.current) return;

    const speed = 2;
    const camera = state.camera;

    // Simple WASD movement
    document.onkeydown = (e) => {
      setIsMoving(true);
      switch (e.key) {
        case 'w':
          characterRef.current.position.z -= speed * delta;
          break;
        case 's':
          characterRef.current.position.z += speed * delta;
          break;
        case 'a':
          characterRef.current.position.x -= speed * delta;
          break;
        case 'd':
          characterRef.current.position.x += speed * delta;
          break;
      }
    };

    document.onkeyup = () => {
      setIsMoving(false);
    };
  });

  return (
    <group position={position}>
      <RpmDirectModel 
        ref={characterRef}
        scale={[1, 1, 1]}
        rotation={[0, Math.PI, 0]} // Face forward
      />
    </group>
  );
}