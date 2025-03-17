import { PointerLockControls } from '@react-three/drei';
import { Player } from './player';
import { useEffect, useRef } from 'react';

export const ConvaiFPS = ({ onLockChange }) => {
  const controlsRef = useRef();

  // Handle ESC key and notify parent component
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && controlsRef.current?.isLocked) {
        controlsRef.current.unlock();
      }
    };

    const handleLock = () => onLockChange?.(true);
    const handleUnlock = () => onLockChange?.(false);

    document.addEventListener('keydown', handleKeyDown);
    const controls = controlsRef.current;
    controls?.addEventListener('lock', handleLock);
    controls?.addEventListener('unlock', handleUnlock);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      controls?.removeEventListener('lock', handleLock);
      controls?.removeEventListener('unlock', handleUnlock);
    };
  }, [onLockChange]);

  return (
    <>
      <PointerLockControls 
        ref={controlsRef}
        selector="#canvas" // Only lock when clicking the canvas
      />
      <Player />
    </>
  );
};