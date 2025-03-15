import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export function RpmDirectModel(props) {
  const group = useRef();
  const modelUrl = "https://models.readyplayer.me/67d3e080a48949c05ca06269.glb?morphTargets=ARKit&textureAtlas=1024&textureFormat=webp&pose=A&quality=high";
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, group);

  // Play an animation when component mounts
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Play the first available animation
      const animationNames = Object.keys(actions);
      actions[animationNames[0]]?.play();
    }
  }, [actions]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}