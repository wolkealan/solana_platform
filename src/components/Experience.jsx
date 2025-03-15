import React, { useState, useEffect } from 'react';
import {
  ContactShadows,
  Grid,
  Sky,
  Stats,
} from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { ConvaiFPS } from './fps/convaiFPS';
import { DualAnimatedCharacter } from './models/DualAnimatedCharacter';

export const Experience = ({ client }) => {
  const [gravity, setGravity] = useState([0, 0, 0]);
  
  useEffect(() => {
    setGravity([0, -9.81, 0]);
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <hemisphereLight
        skyColor={'#fcf9d9'}
        groundColor={'#fcf9d9'}
        intensity={0.5}
        castShadow
      />
      <directionalLight
        position={[500, 100, 500]}
        color={'#fcf9d9'}
        intensity={2}
        castShadow
      />

      <Stats />
      <Physics gravity={gravity}>
        <ConvaiFPS />
        <DualAnimatedCharacter  client={client} position={[0, 0, 0]} /> 
               <Sky />
        <Grid followCamera infiniteGrid fadeDistance={50} />
        <RigidBody type="fixed">
          {/* Your colliders remain the same */}
          <CuboidCollider args={[5, 5, 0.1]} position={[0, 1.5, -3]} />
          <CuboidCollider
            args={[5, 5, 0.1]}
            position={[0, 1.5, 4]}
            rotation={[-Math.PI / 8, 0, 0]}
          />
          <CuboidCollider
            args={[5, 5, 0.1]}
            position={[0, -0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <CuboidCollider
            args={[5, 5, 0.1]}
            position={[3, 1.5, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />
          <CuboidCollider
            args={[5, 5, 0.1]}
            position={[-3, 1.5, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />
        </RigidBody>
      </Physics>
      <ContactShadows opacity={0.7} />
    </>
  );
};