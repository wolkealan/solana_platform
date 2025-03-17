import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { CharacterSelection } from './components/CharacterSelection';
import ChatBubble from './components/chat/Chat';
import { useConvaiClient } from './hooks/useConvaiClient';
import './styles/WalletStyles.css';
import { getUserByWallet, registerUser, updateUserCharacter } from './services/userService';
import './styles/Registration.css';
import SocialMenu from './components/SocialMenu';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  
  const { client } = useConvaiClient('characterId', 'apikey');
  
  // Check if user exists when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      const checkUserExists = async () => {
        try {
          const userData = await getUserByWallet(walletAddress);
          setUser(userData);
          setSelectedCharacter(userData.character);
        } catch (error) {
          // User doesn't exist, we'll need to register
          setIsRegistering(true);
        }
      };
      
      checkUserExists();
    }
  }, [walletConnected, walletAddress]);
  
  // Handle manual wallet address submission
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    
    if (walletAddress.trim().length >= 32) { // Simple validation for Solana address length
      console.log("Wallet address submitted:", walletAddress);
      setWalletConnected(true);
    } else {
      setError("Please enter a valid wallet address");
    }
  };
  
  // Handle user registration
  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    try {
      const userData = await registerUser(walletAddress, username, selectedCharacter);
      setUser(userData);
      setIsRegistering(false);
    } catch (error) {
      setError(error.message || "Registration failed");
    }
  };
  
  const handleCharacterSelected = (characterId) => {
    console.log("Character selected:", characterId);
    setSelectedCharacter(characterId);
    
    // If user is registering, don't proceed yet
    if (isRegistering) {
      return;
    }
    
    // If user exists, update their character preference
    if (user) {
      const updateCharacter = async () => {
        try {
          const updatedUser = await updateUserCharacter(walletAddress, characterId);
          setUser(updatedUser);
        } catch (error) {
          console.error("Failed to update character:", error);
        }
      };
      
      updateCharacter();
    }
  };
  
  // Manual wallet entry component
  const ManualWalletEntry = () => (
    <div className="wallet-connection-container">
      <h1>Welcome to Virtual World</h1>
      <div className="wallet-entry-form">
        <form onSubmit={handleWalletSubmit}>
          <input
            type="text"
            placeholder="Enter your Solana wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="wallet-input"
          />
          <button type="submit" className="wallet-submit-btn">
            Continue
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
      <p>Enter a wallet address to get started</p>
    </div>
  );
  
  // Registration component
  const UserRegistration = React.memo(() => {
    const [localUsername, setLocalUsername] = useState(username);
    
    const handleLocalChange = (e) => {
      setLocalUsername(e.target.value);
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      setUsername(localUsername);
      handleRegistration(e);
    };
  
    return (
      <div className="registration-container">
        <h1>Complete Your Profile</h1>
        <p>Choose a character and create a username</p>
        
        <div className="character-selection-mini">
          <CharacterSelection onCharacterSelected={handleCharacterSelected} />
        </div>
        
        <form onSubmit={handleSubmit} className="registration-form">
          <input
            type="text"
            placeholder="Create a unique username"
            value={localUsername}
            onChange={handleLocalChange}
            className="username-input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="register-btn"
            disabled={!selectedCharacter || !localUsername.trim()}
          >
            Complete Registration
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  });
  
  return (
    <>
      {/* Show manual wallet entry if not connected */}
      {!walletConnected && <ManualWalletEntry />}
      
      {/* Show registration if needed */}
      {walletConnected && isRegistering && <UserRegistration />}
      
      {/* Show character selection if wallet connected but no character selected */}
      {walletConnected && !isRegistering && !selectedCharacter && (
        <CharacterSelection onCharacterSelected={handleCharacterSelected} />
      )}
      
      {/* Show 3D scene after character selection */}
      {walletConnected && !isRegistering && selectedCharacter && (
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
              id="canvas"
              shadows
              camera={{
                position: [0, 0.8, 3],
                fov: 75,
              }}
            >
              <Experience 
                client={client} 
                characterType={selectedCharacter}
                walletAddress={walletAddress}
                onLockChange={setIsPointerLocked}
              />
            </Canvas>
            <Loader />
          </KeyboardControls>
          
          <SocialMenu walletAddress={walletAddress} />
          
          <ChatBubble 
            client={client} 
            isPointerLocked={isPointerLocked}
          />
        </>
      )}
    </>
  );
}

export default App;