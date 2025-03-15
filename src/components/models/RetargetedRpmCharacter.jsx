// src/components/models/RetargetedRpmCharacter.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useRPMLipsync } from '../../hooks/useRPMLipsync';
import { useHeadTracking } from '../../hooks/useHeadTracking';
import * as THREE from 'three';

export function RetargetedRpmCharacter(props) {
  // Load the RPM character
  const { nodes, materials, scene } = useGLTF('/models/rpmcharacter.glb');
  
  // Load the idle_blend animation
  const { animations: idleAnimations } = useGLTF('/animations/idle_blend.glb');
  
  const characterRef = useRef();
  const mixerRef = useRef();
  const [animation, setAnimation] = useState('idle'); // Default to idle animation
  const { client } = props;
  
  // Process animations and setup mixer
  useEffect(() => {
    if (!scene || !idleAnimations.length) return;
    
    // Create animation mixer if it doesn't exist
    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(scene);
      
      // Process animation to retarget from CC_Base_BoneRoot to Hips structure
      const processedAnimations = {};
      
      idleAnimations.forEach(origClip => {
        console.log(`Processing animation: ${origClip.name}`);
        
        // Create new tracks mapped to RPM bone structure
        const tracks = [];
        
        // Map between CC_Base_BoneRoot hierarchy and Hips hierarchy
        const boneMap = {
          'CC_Base_BoneRoot': 'Hips',
          'CC_Base_Hip': 'Hips',
          'CC_Base_Waist': 'Spine',
          'CC_Base_Spine01': 'Spine1',
          'CC_Base_Spine02': 'Spine2',
          'CC_Base_NeckTwist01': 'Neck',
          'CC_Base_Head': 'Head'
          // Add more mappings as needed
        };
        
        // Process each track in the animation
        origClip.tracks.forEach(track => {
          // Extract bone name from track name (e.g., "CC_Base_Hip.position" -> "CC_Base_Hip")
          const trackParts = track.name.split('.');
          const sourceBone = trackParts[0];
          const property = trackParts[1]; // position, quaternion, etc.
          
          // Find corresponding target bone
          const targetBone = boneMap[sourceBone];
          
          if (targetBone) {
            // Create new track with mapped bone name
            const newTrackName = `${targetBone}.${property}`;
            
            // Create a new track with the same data but new name
            const newTrack = new THREE.KeyframeTrack(
              newTrackName,
              track.times,
              track.values
            );
            
            tracks.push(newTrack);
          }
        });
        
        // Create new clip with mapped tracks
        if (tracks.length > 0) {
          const newClip = new THREE.AnimationClip(
            origClip.name,
            origClip.duration,
            tracks
          );
          
          // Store processed animation
          processedAnimations[origClip.name] = newClip;
          
          // Create action and store it for later use
          const action = mixerRef.current.clipAction(newClip);
          console.log(`Created action for ${origClip.name}`);
          
          // Play idle animation by default
          if (origClip.name.toLowerCase().includes('idle')) {
            action.play();
            console.log(`Playing ${origClip.name} animation`);
          }
        }
      });
      
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
  }, [scene, idleAnimations]);
  
  // Apply lipsync and head tracking like Anita
  useRPMLipsync({ client, nodes, scene });
  useHeadTracking({ client, nodes, RPM: true });
  
  return (
    <group {...props} dispose={null} ref={characterRef}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

// Preload assets
useGLTF.preload('/models/rpmcharacter.glb');
useGLTF.preload('/animations/idle_blend.glb');