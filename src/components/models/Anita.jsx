// src/components/models/Anita.jsx
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { useRPMLipsync } from '../../hooks/useRPMLipsync';
import { useHeadTracking } from '../../hooks/useHeadTracking';

export function Anita(props) {
  const { nodes: originalNodes, materials, scene: originalScene, animations: originalAnimations } = useGLTF('/models/anita.glb');
  const { animations: animationClips } = useGLTF('/animations/animations.glb');
  const groupRef = useRef();

  // Clone the scene and animations to ensure unique instances
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

  const clonedAnimations = useMemo(() => [...animationClips], [animationClips]);
  const { actions, mixer } = useAnimations(clonedAnimations, groupRef);

  const [animation, setAnimation] = useState(
    clonedAnimations.find((a) => a.name === 'Idle') ? 'Idle' : clonedAnimations[0]?.name
  );
  const { client } = props;

  // Update animation based on talking state
  useEffect(() => {
    if (client?.isTalking) {
      setAnimation('Talking_0');
    } else {
      setAnimation('Idle');
    }
  }, [client?.isTalking]);

  // Play the selected animation
  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
        .play();
      return () => {
        actions[animation]?.fadeOut(0.5);
      };
    }
  }, [animation, actions, mixer]);

  // Apply lipsync and head tracking
  useRPMLipsync({ client, nodes: originalNodes, scene: clonedScene });
  useHeadTracking({ client, nodes: originalNodes, RPM: true });

  return (
    <group {...props} dispose={null} ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/models/anita.glb');
useGLTF.preload('/animations/animations.glb');