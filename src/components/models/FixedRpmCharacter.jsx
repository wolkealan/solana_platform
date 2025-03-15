// src/components/models/FixedRpmCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { useRPMLipsync } from '../../hooks/useRPMLipsync';
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function FixedRpmCharacter(props) {
  // Load the local model file
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Choose ONE animation source - prioritize animations.glb since it works with Anita
  const { animations } = useGLTF('/animations/animations.glb');
  
  const characterRef = useRef();
  const { actions, mixer } = useAnimations(animations, characterRef);
  
  // For manual testing
  const [animationIndex, setAnimationIndex] = useState(0);
  const availableAnimations = animations.map(a => a.name);
  const [animation, setAnimation] = useState('Idle');
  const [manualTesting, setManualTesting] = useState(false);
  const { client } = props;
  
  // Log available animations for debugging
  useEffect(() => {
    console.log("Available animations:", availableAnimations);
    console.log("Current animation:", animation);
  }, [animation, availableAnimations]);
  
  // Handle key presses for manual testing
  useFrame((state) => {
    if (state.keyboard?.pressed.t && !manualTesting) {
      setManualTesting(true);
      const nextIndex = (animationIndex + 1) % availableAnimations.length;
      setAnimationIndex(nextIndex);
      setAnimation(availableAnimations[nextIndex]);
      console.log(`Switched to animation: ${availableAnimations[nextIndex]}`);
      
      // Reset the flag after a short delay
      setTimeout(() => setManualTesting(false), 300);
    }
  });
  
  // Switch animation based on talking state (only if not manually testing)
  useEffect(() => {
    if (!manualTesting) {
      if (client?.isTalking) {
        const talkAnim = availableAnimations.find(a => a.includes('Talk') || a === 'Talking_0');
        if (talkAnim) setAnimation(talkAnim);
      } else {
        const idleAnim = availableAnimations.find(a => a === 'Idle');
        if (idleAnim) setAnimation(idleAnim);
      }
    }
  }, [client?.isTalking, availableAnimations, manualTesting]);
  
  // Apply the animation
  useEffect(() => {
    // Stop all current animations first
    Object.values(actions).forEach(action => {
      if (action.isRunning()) {
        action.fadeOut(0.5);
      }
    });
    
    // Start the new animation if it exists
    if (actions[animation]) {
      actions[animation].reset().fadeIn(0.5).play();
      console.log(`Playing animation: ${animation}`);
    } else {
      console.warn(`Animation ${animation} not found in available actions:`, Object.keys(actions));
    }
    
    return () => {
      if (actions[animation]) actions[animation].fadeOut(0.5);
    };
  }, [animation, actions]);

  // Apply lipsync and head tracking
  useRPMLipsync({ client, nodes, scene });
  useHeadTracking({ client, nodes, RPM: true });
  
  // Fix hand positions
  useEffect(() => {
    if (nodes.LeftHand) {
      nodes.LeftHand.rotation.set(-0.1, 0, 0.2);
    }
    
    if (nodes.RightHand) {
      nodes.RightHand.rotation.set(-0.1, 0, -0.2);
    }
    
    // Curl fingers slightly
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
  
  return (
    <group {...props} dispose={null} ref={characterRef}>
      <primitive object={nodes.Hips} />
      {/* Dynamically render all skinned meshes */}
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

// Preload required assets
useGLTF.preload('/models/rpmcharacter.glb');
useGLTF.preload('/animations/animations.glb');