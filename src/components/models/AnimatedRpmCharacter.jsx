// src/components/models/AnimatedRpmCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function AnimatedRpmCharacter(props) {
  // Load the RPM character model
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Load the Mixamo animation you exported
  const { animations } = useGLTF('/animations/idle_animation.glb');
  
  const characterRef = useRef();
  const { actions, mixer } = useAnimations(animations, characterRef);
  const { client } = props;
  
  // Play animation on load
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Get the first animation name
      const animationName = Object.keys(actions)[0];
      
      // Log available animations for debugging
      console.log("Available animations:", Object.keys(actions));
      
      // Play the animation
      actions[animationName].reset().fadeIn(0.5).play();
    }
  }, [actions]);
  
  // Apply head tracking without lipsync
  useHeadTracking({ client, nodes, RPM: true });
  
  return (
    <group {...props} dispose={null} ref={characterRef}>
      <primitive object={nodes.Hips} />
      {/* Use the same mesh structure as before */}
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

// Preload assets
useGLTF.preload('/models/rpmcharacter.glb');
useGLTF.preload('/animations/idle_animation.glb');