import React, { useState, useEffect } from 'react';
import {
  ContactShadows,
  Grid,
  Environment,
} from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { ConvaiFPS } from './fps/convaiFPS';
import { Anita } from './models/Anita';
import { DualAnimatedCharacter } from './models/DualAnimatedCharacter';
import { FriendCharacter } from './models/FriendCharacter';
import { getFriends } from '../services/connectionService';
import { friendEvents } from './SocialMenu';
import { Color } from 'three';

export const Experience = ({ client, characterType, walletAddress, onLockChange }) => {
  const [gravity, setGravity] = useState([0, 0, 0]);
  const [friends, setFriends] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setGravity([0, -9.81, 0]);
  }, []);

  useEffect(() => {
    const loadFriends = async () => {
      if (walletAddress) {
        try {
          const friendsData = await getFriends(walletAddress);
          setFriends(friendsData);
        } catch (error) {
          console.error("Failed to load friends:", error);
        }
      }
    };
    
    loadFriends();
    
    const unsubscribe = friendEvents.subscribe(loadFriends);
    
    return () => unsubscribe();
  }, [walletAddress]);

  useEffect(() => {
    const loadFriends = async () => {
      if (walletAddress) {
        try {
          const friendsData = await getFriends(walletAddress);
          setFriends(friendsData);
        } catch (error) {
          console.error("Failed to load friends:", error);
        }
      }
    };
    
    loadFriends();
  }, [walletAddress]);

  const handleLockChange = (locked) => {
    setIsLocked(locked);
    onLockChange?.(locked);
  };

  const renderCharacter = () => {
    console.log("Rendering character:", characterType);
    
    switch(characterType) {
      case 'rpm':
        return <DualAnimatedCharacter client={client} position={[0, 0, 0]} />;
      case 'anita':
        return <Anita client={client} position={[0, 0, 0]} />;
      default:
        console.warn("Unknown character type:", characterType);
        return <DualAnimatedCharacter client={client} position={[0, 0, 0]} />;
    }
  };
  
  const positionFriend = (index, total) => {
    const radius = 5;
    const angle = (index / total) * Math.PI * 1.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return [x, 0, z];
  };

  return (
    <>
      <ambientLight intensity={0.2} />
      <hemisphereLight
        skyColor={new Color(0x1a1a2e)}
        groundColor={new Color(0x0f0f1c)}
        intensity={0.5}
        castShadow
      />
      <directionalLight
        position={[500, 100, 500]}
        color={new Color(0xff00ff)}
        intensity={2}
        castShadow
      />

      <Physics gravity={gravity}>
        <ConvaiFPS onLockChange={handleLockChange} />
        {renderCharacter()}
        
        {friends.map((friend, index) => (
          <FriendCharacter 
            key={friend.walletAddress}
            friendData={friend}
            position={positionFriend(index, friends.length)}
          />
        ))}
        
        <Environment
          background
          files="/assets/golden_bay_2k.exr" // Ensure this path is correct
          ground={{
            height: 10,
            radius: 50,
            scale: 100,
          }}
        />
        <Grid followCamera infiniteGrid fadeDistance={50} />
        <RigidBody type="fixed">
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