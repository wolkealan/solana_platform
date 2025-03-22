// src/components/models/RpmGirl4.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useMemo } from 'react';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function RpmGirl4(props) {
  // Load the RPM Girl4 model
  const { nodes: originalNodes, materials, scene: originalScene } = useGLTF('/models/rpmgirl4.glb');
  
  // Load the animation for RPM Girl4
  const { animations: originalAnimations } = useGLTF('/animations/g4_mod.glb');
  
  const groupRef = useRef();

  // Clone the scene to ensure unique instances
  const clonedScene = useMemo(() => {
    const cloneScene = clone(originalScene);
    cloneScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloneScene;
  }, [originalScene]);

  // Clone animations to avoid sharing
  const clonedAnimations = useMemo(() => [...originalAnimations], [originalAnimations]);
  
  const { actions, mixer } = useAnimations(clonedAnimations, groupRef);

  // Get first animation name or use a default
  const firstAnimation = clonedAnimations.length > 0 ? clonedAnimations[0].name : null;

  // Play the animation on load
  useEffect(() => {
    if (actions && firstAnimation && actions[firstAnimation]) {
      console.log("Playing animation:", firstAnimation);
      actions[firstAnimation].reset().fadeIn(0.5).play();
    } else if (actions && Object.keys(actions).length > 0) {
      // Fallback to first available animation
      const animName = Object.keys(actions)[0];
      console.log("Playing fallback animation:", animName);
      actions[animName].reset().fadeIn(0.5).play();
    }
  }, [actions, firstAnimation]);

  // Apply head tracking
  useHeadTracking({ nodes: originalNodes, RPM: true });

  return (
    <group {...props} dispose={null} ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload assets
useGLTF.preload('/models/rpmgirl4.glb');
useGLTF.preload('/animations/g4_mod.glb');