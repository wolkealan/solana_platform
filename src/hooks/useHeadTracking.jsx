// Modified useHeadTracking.js - Works without client dependency
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const useHeadTracking = ({ nodes, RPM }) => {
  useFrame((state, _delta) => {
    // Remove client-dependent condition
    // if (client?.action?.currentAction && client?.action?.currentAction !== 'None') {
    //   return;
    // }

    // Continue with head tracking logic
    const cameraWorldDirection = state.camera.getWorldDirection(
      new THREE.Vector3()
    );
    const npcWorldDirection = nodes.Head.getWorldDirection(new THREE.Vector3());
    const cameraWorldPosition = state.camera.getWorldPosition(
      new THREE.Vector3()
    );
    const npcWorldPosition = nodes.Head.getWorldPosition(new THREE.Vector3());
    
    cameraWorldDirection.normalize();
    npcWorldDirection.normalize();
    
    const angle = Math.acos(cameraWorldDirection.dot(npcWorldDirection));
    const angelDegrees = THREE.MathUtils.radToDeg(angle);
    const distance = cameraWorldPosition.distanceTo(npcWorldPosition);
    
    // Simplified condition without client dependency
    if (angelDegrees > 120 && angelDegrees < 260) {
      if (distance < 5) {
        // Head Lock
        if (RPM) {
          nodes.Head.lookAt(cameraWorldPosition);
        }
      }
    }
  });
};