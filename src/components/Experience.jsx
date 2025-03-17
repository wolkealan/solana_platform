import React, { useState, useEffect } from 'react';
import {
  ContactShadows,
  Grid,
  Sky,
  Stats,
} from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { ConvaiFPS } from './fps/convaiFPS';
import { Anita } from './models/Anita';
import { DualAnimatedCharacter } from './models/DualAnimatedCharacter';
import { FriendCharacter } from './models/FriendCharacter';
import { getFriends } from '../services/connectionService';
import { friendEvents } from './SocialMenu';

export const Experience = ({ client, characterType, walletAddress, onLockChange }) => {
  const [gravity, setGravity] = useState([0, 0, 0]);
  const [friends, setFriends] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setGravity([0, -9.81, 0]);
  }, []);

  // Inside Experience component
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
    
    // Subscribe to friend updates
    const unsubscribe = friendEvents.subscribe(loadFriends);
    
    return () => unsubscribe();
  }, [walletAddress]);

  // Fetch friends when component mounts
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

  // Handle lock state changes
  const handleLockChange = (locked) => {
    setIsLocked(locked);
    onLockChange?.(locked); // Notify parent component (App)
  };

  // Render different character based on selection
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
  
  // Position friends in a semi-circle around the player
  const positionFriend = (index, total) => {
    const radius = 5; // Distance from center
    const angle = (index / total) * Math.PI * 1.5; // Spread in a semi-circle
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return [x, 0, z];
  };

  return (
    <>
      {/* lights */}
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

      {/* models */}
      <Stats />
      <Physics gravity={gravity}>
        <ConvaiFPS onLockChange={handleLockChange} />
        {renderCharacter()}
        
        {/* Render friends */}
        {friends.map((friend, index) => (
          <FriendCharacter 
            key={friend.walletAddress}
            friendData={friend}
            position={positionFriend(index, friends.length)}
          />
        ))}
        
        <Sky />
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