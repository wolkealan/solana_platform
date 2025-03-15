// src/App.jsx
import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { KeyboardControls } from '@react-three/drei';
import { useConvaiClient } from './hooks/useConvaiClient';
import ChatBubble from './components/chat/Chat';

function App() {
  /**
   * Add apikey and character id here
   */
  const { client } = useConvaiClient('characterId', 'apikey');
  
  return (
    <>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'sprint', keys: ['Shift'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <Canvas
          shadows
          camera={{
            position: [0, 0.8, 3],
            fov: 75,
          }}
        >
          <Experience client={client} />
        </Canvas>
      </KeyboardControls>
      <ChatBubble client={client} />
    </>
  );
}

export default App;