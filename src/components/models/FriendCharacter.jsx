// src/components/models/FriendCharacter.jsx
import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { Anita } from './Anita';
import { DualAnimatedCharacter } from './DualAnimatedCharacter';

export const FriendCharacter = ({ friendData, position }) => {
  const { character, username } = friendData;
  const groupRef = useRef();

  // Render based on character type
  const renderCharacter = () => {
    switch(character) {
      case 'rpm':
        return <DualAnimatedCharacter position={[0, 0, 0]} />;
      case 'anita':
        return <Anita position={[0, 0, 0]} />;
      default:
        console.warn("Unknown character type for friend:", character);
        return <DualAnimatedCharacter position={[0, 0, 0]} />;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {renderCharacter()}
      <Html position={[0, 2, 0]} center>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {username}
        </div>
      </Html>
    </group>
  );
};