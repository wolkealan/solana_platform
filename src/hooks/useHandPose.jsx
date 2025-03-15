import { useEffect } from 'react';

export const useHandPose = ({ nodes, pose = 'relaxed' }) => {
  useEffect(() => {
    if (!nodes) return;
    
    const poses = {
      relaxed: () => {
        // Left hand
        if (nodes.LeftHand) {
          nodes.LeftHand.rotation.set(-0.2, 0, 0.1);
        }
        
        // Right hand
        if (nodes.RightHand) {
          nodes.RightHand.rotation.set(-0.2, 0, -0.1);
        }
        
        // Slightly curl fingers for a relaxed pose
        for (let i = 1; i <= 4; i++) {
          // Thumb has different curling direction
          if (nodes[`LeftHandThumb${i}`]) {
            nodes[`LeftHandThumb${i}`].rotation.z = 0.1 * i;
          }
          if (nodes[`RightHandThumb${i}`]) {
            nodes[`RightHandThumb${i}`].rotation.z = -0.1 * i;
          }
          
          // Other fingers
          ['Index', 'Middle', 'Ring', 'Pinky'].forEach(finger => {
            if (nodes[`LeftHand${finger}${i}`]) {
              nodes[`LeftHand${finger}${i}`].rotation.x = 0.1 * i;
            }
            if (nodes[`RightHand${finger}${i}`]) {
              nodes[`RightHand${finger}${i}`].rotation.x = 0.1 * i;
            }
          });
        }
      },
      
      natural: () => {
        // A more natural, slightly open hand pose
        // Left hand
        if (nodes.LeftHand) {
          nodes.LeftHand.rotation.set(-0.1, 0.1, 0);
        }
        
        // Right hand
        if (nodes.RightHand) {
          nodes.RightHand.rotation.set(-0.1, -0.1, 0);
        }
        
        // Keep fingers slightly curled
        for (let i = 1; i <= 4; i++) {
          ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].forEach(finger => {
            if (nodes[`LeftHand${finger}${i}`]) {
              nodes[`LeftHand${finger}${i}`].rotation.x = 0.05 * i;
            }
            if (nodes[`RightHand${finger}${i}`]) {
              nodes[`RightHand${finger}${i}`].rotation.x = 0.05 * i;
            }
          });
        }
      }
    };
    
    // Apply the selected pose
    if (poses[pose]) {
      poses[pose]();
    }
  }, [nodes, pose]);
};