// src/components/models/DualAnimatedCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { useFrame } from '@react-three/fiber';
// Remove this import if it's client-dependent
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function DualAnimatedCharacter(props) {
  const { nodes: originalNodes, materials, scene: originalScene } = useGLTF('/models/rpmcharacter.glb');
  const { animations: idleAnimations } = useGLTF('/animations/idle_animation.glb');
  const { animations: specialAnimations } = useGLTF('/animations/nazi.glb');
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
  const clonedIdleAnimations = useMemo(() => [...idleAnimations], [idleAnimations]);
  const clonedSpecialAnimations = useMemo(() => [...specialAnimations], [specialAnimations]);

  const { actions: idleActions, mixer: idleMixer } = useAnimations(clonedIdleAnimations, groupRef);
  const { actions: specialActions, mixer: specialMixer } = useAnimations(clonedSpecialAnimations, groupRef);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [isSpecialKeyPressed, setIsSpecialKeyPressed] = useState(false);
  
  // Remove client references
  // const { client } = props;

  // Handle key press for special animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n' || e.key === 'N') {
        setIsSpecialKeyPressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'n' || e.key === 'N') {
        setIsSpecialKeyPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Set animation based on state - remove client dependency
  useEffect(() => {
    if (isSpecialKeyPressed) {
      setCurrentAnimation('special');
    } else {
      // Replace client?.isTalking with just 'idle'
      setCurrentAnimation('idle');
    }
  }, [isSpecialKeyPressed]);

  // Play the appropriate animation
  useEffect(() => {
    // Stop all running animations
    Object.values(idleActions).forEach((action) => action?.isRunning() && action.fadeOut(0.5));
    Object.values(specialActions).forEach((action) => action?.isRunning() && action.fadeOut(0.5));

    if (currentAnimation === 'special' && Object.keys(specialActions).length > 0) {
      const actionName = Object.keys(specialActions)[0];
      specialActions[actionName]?.reset().fadeIn(0.5).play();
      console.log("Playing special animation:", actionName);
    } else if (currentAnimation === 'idle' && Object.keys(idleActions).length > 0) {
      const actionName = Object.keys(idleActions)[0];
      idleActions[actionName]?.reset().fadeIn(0.5).play();
      console.log("Playing idle animation:", actionName);
    } else if (currentAnimation === 'talking' && Object.keys(idleActions).length > 1) {
      const actionName = Object.keys(idleActions).find((name) => name.toLowerCase().includes('talk'));
      if (actionName) {
        idleActions[actionName]?.reset().fadeIn(0.5).play();
        console.log("Playing talking animation:", actionName);
      } else {
        const fallbackName = Object.keys(idleActions)[0];
        idleActions[fallbackName]?.reset().fadeIn(0.5).play();
        console.log("No talking animation found, playing:", fallbackName);
      }
    }
  }, [currentAnimation, idleActions, specialActions]);

  // Update animations
  useFrame((state, delta) => {
    idleMixer?.update(delta);
    specialMixer?.update(delta);
  });

  // Remove head tracking if it depends on client
  useHeadTracking({ nodes: originalNodes, RPM: true });

  return (
    <group {...props} dispose={null} ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload all assets
useGLTF.preload('/models/rpmcharacter.glb');
useGLTF.preload('/animations/idle_animation.glb');
useGLTF.preload('/animations/nazi.glb');