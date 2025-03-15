// src/components/models/IdleBlendCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useHeadTracking } from '../../hooks/useHeadTracking';
import * as THREE from 'three';

export function IdleBlendCharacter(props) {
  // Load the local model file
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Load the idle_blend animation
  const { animations } = useGLTF('/animations/idle_blend.glb');
  
  const characterRef = useRef();
  const mixerRef = useRef();
  const { client } = props;
  
  // Set up animation mixer and track animation state
  const [animationApplied, setAnimationApplied] = useState(false);
  
  // Initialize animation mixer once
  useEffect(() => {
    if (scene && animations.length > 0 && !mixerRef.current) {
      // Create mixer
      mixerRef.current = new THREE.AnimationMixer(scene);
      
      // Log available animations
      console.log("Idle blend animations:", animations.map(anim => anim.name));
      
      // Start animation loop
      const clock = new THREE.Clock();
      const animate = () => {
        if (mixerRef.current) {
          mixerRef.current.update(clock.getDelta());
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [scene, animations]);
  
  // Apply idle animation carefully
  useEffect(() => {
    if (!mixerRef.current || !animations.length || animationApplied) return;
    
    try {
      // Fix hand positions first
      if (nodes.LeftHand) {
        nodes.LeftHand.rotation.set(-0.1, 0, 0.2);
      }
      
      if (nodes.RightHand) {
        nodes.RightHand.rotation.set(-0.1, 0, -0.2);
      }
      
      // Curl fingers for a natural pose
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
      
      // Now try to apply the idle_blend animation
      // But only apply it to the spine and head, not to hands
      const clip = animations[0];
      
      // Create a modifier that excludes hands
      const tracks = clip.tracks.filter(track => {
        return !track.name.includes('Hand') && !track.name.includes('Arm');
      });
      
      // Create a new clip without hand and arm animations
      const safeClip = new THREE.AnimationClip(
        'safe-idle', 
        clip.duration, 
        tracks
      );
      
      // Play the safe clip
      const action = mixerRef.current.clipAction(safeClip);
      action.play();
      
      setAnimationApplied(true);
      console.log("Applied safe idle animation");
    } catch (error) {
      console.error("Error applying animation:", error);
    }
  }, [nodes, animations, animationApplied]);
  
  // Apply head tracking
  useHeadTracking({ client, nodes, RPM: true });
  
  return (
    <group {...props} dispose={null} ref={characterRef}>
      <primitive object={nodes.Hips} />
      {/* Render all skinned meshes */}
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
useGLTF.preload('/animations/idle_blend.glb');