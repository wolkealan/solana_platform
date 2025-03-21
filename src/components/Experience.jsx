// src/components/Experience.jsx
import React, { useState, useEffect } from 'react';
import { ContactShadows, Grid, Environment } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { ConvaiFPS } from './fps/convaiFPS';
import { Anita } from './models/Anita';
import { DualAnimatedCharacter } from './models/DualAnimatedCharacter';
import { RpmGirl } from './models/RpmGirl';
import { RpmGirl2 } from './models/RpmGirl2';
import { RpmGirl3 } from './models/RpmGirl3';
import { RpmGirl4 } from './models/RpmGirl4';
import { RpmGirl5 } from './models/RpmGirl5';
import { RpmSigma } from './models/RpmSigma';
import { RpmOrangie } from './models/RpmOrangie';
import { RpmCharacter2 } from './models/RpmCharacter2';
import { RpmTrump } from './models/RpmTrump';
import { RpmNig } from './models/RpmNig';
import { FriendCharacter } from './models/FriendCharacter';
import { getFriends } from '../services/connectionService';
import { friendEvents } from './SocialMenu';
import { Color } from 'three';

export const Experience = ({ characterType, walletAddress, onLockChange }) => {
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
          console.log('Loaded friends:', friendsData);
          setFriends(friendsData);
        } catch (error) {
          console.error('Failed to load friends:', error);
        }
      }
    };

    loadFriends();
    const unsubscribe = friendEvents.subscribe(loadFriends);
    return () => unsubscribe();
  }, [walletAddress]);

  const handleLockChange = (locked) => {
    setIsLocked(locked);
    onLockChange?.(locked);
  };

  const renderCharacter = () => {
    console.log('Rendering character:', characterType);
    switch (characterType) {
      case 'rpm':
        return <DualAnimatedCharacter position={[0, 0, 0]} />;
      case 'anita':
        return <Anita position={[0, 0, 0]} />;
      case 'rpmgirl':
        return <RpmGirl position={[0, 0, 0]} />;
      case 'rpmgirl2':
        return <RpmGirl2 position={[0, 0, 0]} />;
      case 'rpmgirl3':
        return <RpmGirl3 position={[0, 0, 0]} />;
      case 'rpmgirl4':
        return <RpmGirl4 position={[0, 0, 0]} />;
      case 'rpmgirl5':
        return <RpmGirl5 position={[0, 0, 0]} />;
      case 'rpmsigma':
        return <RpmSigma position={[0, 0, 0]} />;
      case 'rpmorangie':
        return <RpmOrangie position={[0, 0, 0]} />;
      case 'rpmcharacter2':
        return <RpmCharacter2 position={[0, 0, 0]} />;
      case 'rpmtrump':
        return <RpmTrump position={[0, 0, 0]} />;
      case 'rpmnig':
        return <RpmNig position={[0, 0, 0]} />;
      default:
        console.warn('Unknown character type:', characterType);
        return <DualAnimatedCharacter position={[0, 0, 0]} />;
    }
  };

  const positionFriend = (index, total) => {
    const radius = total > 1 ? 5 : 3;
    const minAngle = Math.PI / 6;
    const maxSpread = Math.PI * 1.5;
    const angleStep = Math.min(maxSpread / Math.max(1, total - 1), minAngle);
    const angle = (index * angleStep) - (maxSpread / 2);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return [x, 0, z];
  };

  return (
    <>
      <Environment
        background
        files="/assets/transformed.hdr"
        ground={{
          height: 10,
          radius: 50,
          scale: 100,
        }}
      />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[500, 100, 500]}
        color={new Color(0xffffff)}
        intensity={0.5}
        castShadow
      />
      <pointLight
        position={[0, 10, 0]}
        color={new Color(0xffffff)}
        intensity={0.5}
        distance={30}
        decay={2}
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