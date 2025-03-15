// src/components/models/DualAnimatedCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function DualAnimatedCharacter(props) {
  // Load the RPM character model
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Load both animations
  const { animations: idleAnimations } = useGLTF('/animations/idle_animation.glb');
  const { animations: specialAnimations } = useGLTF('/animations/nazi.glb');
  
  const characterRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [isSpecialKeyPressed, setIsSpecialKeyPressed] = useState(false);
  const { client } = props;
  
  // Set up animations
  const { actions: idleActions, mixer: idleMixer } = useAnimations(idleAnimations, characterRef);
  const { actions: specialActions, mixer: specialMixer } = useAnimations(specialAnimations, characterRef);
  
  // Handle key press for special animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Use 'N' key to trigger the special animation
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
  
  // Set the current animation based on key press
  useEffect(() => {
    if (isSpecialKeyPressed) {
      setCurrentAnimation('special');
    } else {
      // Return to idle animation or talking based on client state
      setCurrentAnimation(client?.isTalking ? 'talking' : 'idle');
    }
  }, [isSpecialKeyPressed, client?.isTalking]);
  
  // Play the appropriate animation
  useEffect(() => {
    // Stop all running animations
    Object.values(idleActions).forEach(action => {
      if (action.isRunning()) {
        action.fadeOut(0.5);
      }
    });
    
    Object.values(specialActions).forEach(action => {
      if (action.isRunning()) {
        action.fadeOut(0.5);
      }
    });
    
    // Start the appropriate animation
    if (currentAnimation === 'special' && Object.keys(specialActions).length > 0) {
      // Play the special animation
      const actionName = Object.keys(specialActions)[0];
      specialActions[actionName].reset().fadeIn(0.5).play();
      console.log("Playing special animation:", actionName);
    } else if (currentAnimation === 'idle' && Object.keys(idleActions).length > 0) {
      // Play the idle animation
      const actionName = Object.keys(idleActions)[0];
      idleActions[actionName].reset().fadeIn(0.5).play();
      console.log("Playing idle animation:", actionName);
    } else if (currentAnimation === 'talking' && Object.keys(idleActions).length > 1) {
      // If there's a talking animation, play it
      const actionName = Object.keys(idleActions).find(name => name.toLowerCase().includes('talk'));
      if (actionName) {
        idleActions[actionName].reset().fadeIn(0.5).play();
        console.log("Playing talking animation:", actionName);
      } else {
        // Fallback to the first animation if no talking animation is found
        const fallbackName = Object.keys(idleActions)[0];
        idleActions[fallbackName].reset().fadeIn(0.5).play();
        console.log("No talking animation found, playing:", fallbackName);
      }
    }
  }, [currentAnimation, idleActions, specialActions]);
  
  // Animation update loop
  useFrame((state, delta) => {
    if (idleMixer) idleMixer.update(delta);
    if (specialMixer) specialMixer.update(delta);
  });
  
  // Apply head tracking
  useHeadTracking({ client, nodes, RPM: true });
  
  return (
    <group {...props} dispose={null} ref={characterRef}>
      <primitive object={nodes.Hips} />
      {/* Use dynamic rendering for all meshes */}
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

// Preload all assets
useGLTF.preload('/models/rpmcharacter.glb');
useGLTF.preload('/animations/idle_animation.glb');
useGLTF.preload('/animations/nazi.glb');