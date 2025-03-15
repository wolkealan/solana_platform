// src/components/models/WorkingRpmCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useRPMLipsync } from '../../hooks/useRPMLipsync';
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function WorkingRpmCharacter(props) {
  // Load the local model file
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Create reference without any external animations
  const characterRef = useRef();
  const { client } = props;
  
  // Fix hand positions manually
  useEffect(() => {
    // Fix hand positions
    if (nodes.LeftHand) {
      nodes.LeftHand.rotation.set(-0.1, 0, 0.2);
    }
    
    if (nodes.RightHand) {
      nodes.RightHand.rotation.set(-0.1, 0, -0.2);
    }
    
    // Slightly curl fingers for a more natural pose
    for (let i = 1; i <= 4; i++) {
      if (nodes[`LeftHandThumb${i}`]) nodes[`LeftHandThumb${i}`].rotation.x = 0.2 * i;
      if (nodes[`LeftHandIndex${i}`]) nodes[`LeftHandIndex${i}`].rotation.x = 0.15 * i;
      if (nodes[`LeftHandMiddle${i}`]) nodes[`LeftHandMiddle${i}`].rotation.x = 0.15 * i;
      if (nodes[`LeftHandRing${i}`]) nodes[`LeftHandRing${i}`].rotation.x = 0.15 * i;
      if (nodes[`LeftHandPinky${i}`]) nodes[`LeftHandPinky${i}`].rotation.x = 0.15 * i;
      
      if (nodes[`RightHandThumb${i}`]) nodes[`RightHandThumb${i}`].rotation.x = 0.2 * i;
      if (nodes[`RightHandIndex${i}`]) nodes[`RightHandIndex${i}`].rotation.x = 0.15 * i;
      if (nodes[`RightHandMiddle${i}`]) nodes[`RightHandMiddle${i}`].rotation.x = 0.15 * i;
      if (nodes[`RightHandRing${i}`]) nodes[`RightHandRing${i}`].rotation.x = 0.15 * i;
      if (nodes[`RightHandPinky${i}`]) nodes[`RightHandPinky${i}`].rotation.x = 0.15 * i;
    }
  }, [nodes]);
  
  // Only use head tracking without lipsync
  useHeadTracking({ client, nodes, RPM: true });
  
  return (
    <group {...props} dispose={null} ref={characterRef}>
      <primitive object={nodes.Hips} />
      {/* Use dynamic rendering for all skinned meshes */}
      {Object.keys(nodes)
        .filter(name => nodes[name].type === 'SkinnedMesh')
        .map(name => (
          <skinnedMesh
            key={name}
            name={name}
            geometry={nodes[name].geometry}
            material={materials[nodes[name].material.name]}
            skeleton={nodes[name].skeleton}
            morphTargetDictionary={nodes[name].morphTargetDictionary}
            morphTargetInfluences={nodes[name].morphTargetInfluences}
          />
        ))}
    </group>
  );
}

// Preload the character model
useGLTF.preload('/models/rpmcharacter.glb');