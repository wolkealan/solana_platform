// src/components/models/FullIdleBlendCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useHeadTracking } from '../../hooks/useHeadTracking';
import * as THREE from 'three';

export function FullIdleBlendCharacter(props) {
  // Load the local model file
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Load the idle_blend animation
  const { animations } = useGLTF('/animations/idle_blend.glb');
  
  const characterRef = useRef();
  const mixerRef = useRef();
  const { client } = props;
  
  // Initialize animation mixer once
  useEffect(() => {
    if (scene && animations.length > 0 && !mixerRef.current) {
      // Create mixer
      mixerRef.current = new THREE.AnimationMixer(scene);
      
      // Log available animations
      console.log("Idle blend animations:", animations.map(anim => anim.name));
      
      // Apply animation
      const clip = animations[0];
      const action = mixerRef.current.clipAction(clip);
      action.play();
      
      // Start animation loop
      const clock = new THREE.Clock();
      const animate = () => {
        if (mixerRef.current) {
          mixerRef.current.update(clock.getDelta());
        }
        requestAnimationFrame(animate);
      };
      animate();
      
      console.log("Applied full idle animation");
    }
  }, [scene, animations]);
  
  // Custom head tracking like Anita - limit rotation angles
  useEffect(() => {
    if (!client || !nodes.Head) return;
    
    const headNode = nodes.Head;
    const originalRotation = headNode.rotation.clone();
    
    // Add limiting logic to head rotation
    const updateHeadRotation = () => {
      if (client?.isTalking) {
        const cameraPosition = new THREE.Vector3(0, 0.8, 3); // Typical camera position
        
        // Create a vector from head to camera
        const headPosition = new THREE.Vector3();
        headNode.getWorldPosition(headPosition);
        const direction = new THREE.Vector3().subVectors(cameraPosition, headPosition).normalize();
        
        // Create a temporary object to calculate the look rotation
        const lookTarget = new THREE.Object3D();
        lookTarget.position.copy(cameraPosition);
        lookTarget.lookAt(headPosition);
        
        // Limit rotation angles similar to Anita
        const maxRotationY = 0.5; // About 30 degrees
        const maxRotationX = 0.3; // About 17 degrees
        
        // Calculate limited rotation
        const newRotationY = Math.max(-maxRotationY, Math.min(maxRotationY, lookTarget.rotation.y));
        const newRotationX = Math.max(-maxRotationX, Math.min(maxRotationX, lookTarget.rotation.x));
        
        // Apply limited rotation
        headNode.rotation.y = originalRotation.y + newRotationY;
        headNode.rotation.x = originalRotation.x + newRotationX;
      } else {
        // Reset to original or idle animation rotation
        headNode.rotation.copy(originalRotation);
      }
    };
    
    // Update on animation frame
    const intervalId = setInterval(updateHeadRotation, 50);
    
    return () => clearInterval(intervalId);
  }, [client, nodes.Head]);
  
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