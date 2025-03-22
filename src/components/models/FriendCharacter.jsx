// src/components/models/FriendCharacter.jsx
import React, { useRef, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Anita } from './Anita';
import { DualAnimatedCharacter } from './DualAnimatedCharacter';
import { RpmGirl } from './RpmGirl';
import { RpmGirl2 } from './RpmGirl2';
import { RpmGirl3 } from './RpmGirl3';
import { RpmGirl4 } from './RpmGirl4';
import { RpmGirl5 } from './RpmGirl5';
import { RpmSigma } from './RpmSigma';
import { RpmOrangie } from './RpmOrangie';
import { RpmCharacter2 } from './RpmCharacter2';
import { RpmTrump } from './RpmTrump';
import { RpmNig } from './RpmNig';
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
      case 'rpmgirl':
        return <RpmGirl />;
      case 'rpmgirl2':
        return <RpmGirl2 />;
      case 'rpmgirl3':
        return <RpmGirl3 />;
      case 'rpmgirl4':
        return <RpmGirl4 />;
      case 'rpmgirl5':
        return <RpmGirl5 />;
      case 'rpmsigma':
        return <RpmSigma />;
      case 'rpmorangie':
        return <RpmOrangie />;
      case 'rpmcharacter2':
        return <RpmCharacter2 />;
      case 'rpmtrump':
        return <RpmTrump />;
      case 'rpmnig':
        return <RpmNig />;
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