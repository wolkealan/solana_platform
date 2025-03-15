// src/components/models/LocalRpmCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useRPMLipsync } from '../../hooks/useRPMLipsync';
import { useHeadTracking } from '../../hooks/useHeadTracking';
import { useFrame } from '@react-three/fiber';

export function LocalRpmCharacter(props) {
  // Load the local model file
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  // Load the new animation file
  const { animations: idleAnimations } = useGLTF('/animations/idle_blend.glb');
  // Also load the original animations as fallback
  const { animations: originalAnimations } = useGLTF('/animations/animations.glb');
  
  // Combine animations from both sources
  const animations = [...idleAnimations, ...originalAnimations];
  
  const characterRef = useRef();
  const { actions, mixer } = useAnimations(animations, characterRef);
  const [animationIndex, setAnimationIndex] = useState(0);
const availableAnimations = Object.keys(actions);

// Add key handler to cycle through animations
useFrame((state, delta) => {
    // Press 'T' to toggle between animations
    if (state.controls?.keys?.t && !state.controls.keys.tPressed) {
      state.controls.keys.tPressed = true;
      const nextIndex = (animationIndex + 1) % availableAnimations.length;
      setAnimationIndex(nextIndex);
      setAnimation(availableAnimations[nextIndex]);
      console.log(`Switched to animation: ${availableAnimations[nextIndex]}`);
    }
    if (!state.controls?.keys?.t) {
      state.controls.keys.tPressed = false;
    }
  });
  
  // Find appropriate animation names
  const idleAnimName = idleAnimations.length > 0 ? idleAnimations[0].name : 
                       (animations.find(a => a.name === 'Idle') ? 'Idle' : animations[0].name);
  
  const talkingAnimName = animations.find(a => a.name.includes('Talking') || a.name.includes('Talk')) ? 
                         (animations.find(a => a.name.includes('Talking')) ? animations.find(a => a.name.includes('Talking')).name : 'Talking_0') :
                         (animations[1] ? animations[1].name : animations[0].name);
  
  const [animation, setAnimation] = useState(idleAnimName);
  const { client } = props;
  
  // Debug current animation state
  useEffect(() => {
    console.log("Available animations:", animations.map(a => a.name));
    console.log("Using idle animation:", idleAnimName);
    console.log("Using talking animation:", talkingAnimName);
  }, []);
  
  // Switch animation based on talking state
  useEffect(() => {
    if (client?.isTalking) {
      setAnimation(talkingAnimName);
    } else {
      setAnimation(idleAnimName);
    }
  }, [client?.isTalking, idleAnimName, talkingAnimName]);
  
  // Play the animation
  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
        .play();
      return () => actions[animation].fadeOut(0.5);
    } else {
      console.warn(`Animation ${animation} not found in available actions:`, Object.keys(actions));
    }
  }, [animation, actions, mixer?.stats?.actions?.inUse]);

  // Apply lipsync and head tracking
  useRPMLipsync({ client, nodes, scene });
  useHeadTracking({ client, nodes, RPM: true });
  
  // Log structure to help with debugging
  useEffect(() => {
    console.log("Model nodes:", Object.keys(nodes));
    
    // Fix hand positions
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

// Preload all required assets
useGLTF.preload('/models/rpmcharacter.glb');
useGLTF.preload('/animations/idle_blend.glb');
useGLTF.preload('/animations/animations.glb');