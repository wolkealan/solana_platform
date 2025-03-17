// src/components/models/FriendCharacter.jsx
import React, { useRef, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Anita } from './Anita';
import { DualAnimatedCharacter } from './DualAnimatedCharacter';
import { useFrame } from '@react-three/fiber';

export const FriendCharacter = ({ friendData, position }) => {
  const { character, username } = friendData;
  const groupRef = useRef();

  // Render based on character type
  const renderCharacter = () => {
    switch (character) {
      case 'rpm':
        return <DualAnimatedCharacter />;
      case 'anita':
        return <Anita />;
      default:
        console.warn("Unknown character type for friend:", character);
        return <DualAnimatedCharacter />;
    }
  };

  // Memoize the character instance
  const characterInstance = useMemo(() => renderCharacter(), [character]);

  // Optional: Rotate to face the center
  useFrame(() => {
    if (groupRef.current) {
      const [x, , z] = position;
      const angle = Math.atan2(-x, -z);
      groupRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {characterInstance}
      <Html position={[0, 2, 0]} center>
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {username}
        </div>
      </Html>
    </group>
  );
};