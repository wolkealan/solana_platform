// Modified App.jsx with landing page integration and no automatic mic access
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { CharacterSelection } from './components/CharacterSelection';
// import { useConvaiClient } from './hooks/useConvaiClient';
import './styles/WalletStyles.css';
import { getUserByWallet, registerUser, updateUserCharacter } from './services/userService';
import './styles/Registration.css';
import SocialMenu from './components/SocialMenu';
import LeaderboardPage from './components/LeaderboardPage';
import './styles/LoadingTransition.css';
import LandingPage from './components/LandingPage'; // Import the landing page component

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true); // State to control landing page visibility
  
  // const { client } = useConvaiClient('characterId', 'apikey'); // The hook now initializes with audio disabled
  
  useEffect(() => {
    if (walletConnected && walletAddress) {
      const checkUserExists = async () => {
        try {
          const userData = await getUserByWallet(walletAddress);
          setUser(userData);
          setSelectedCharacter(userData.character);
        } catch (error) {
          setIsRegistering(true);
        }
      };
      
      checkUserExists();
    }
  }, [walletConnected, walletAddress]);
  
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    
    if (walletAddress.trim().length >= 32) {
      console.log("Wallet address submitted:", walletAddress);
      setWalletConnected(true);
    } else {
      setError("Please enter a valid wallet address");
    }
  };
  
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
    
    if (isRegistering) {
      return;
    }
    
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
  
  const handlePointerLockChange = (isLocked) => {
    if (!showLeaderboard) {
      setIsPointerLocked(isLocked);
    }
  };

  const handleToggleLeaderboard = (show) => {
    if (show) {
      // Show leaderboard immediately
      setShowLeaderboard(true);
      
      // Release pointer lock when showing leaderboard
      if (isPointerLocked) {
        // Find pointer lock controls and unlock
        const pointerLockElement = document.pointerLockElement || 
                                  document.mozPointerLockElement || 
                                  document.webkitPointerLockElement;
        if (pointerLockElement) {
          document.exitPointerLock = document.exitPointerLock || 
                                   document.mozExitPointerLock || 
                                   document.webkitExitPointerLock;
          document.exitPointerLock();
        }
      }
    } else {
      // Start transition when returning to 3D world
      setIsTransitioning(true);
      
      // After showing loading transition, hide leaderboard
      setTimeout(() => {
        setShowLeaderboard(false);
        
        // Wait for canvas to load, then hide transition
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1500); // Adjust this timing based on how long your 3D scene takes to render
      }, 500); // Short delay to show the transition screen
    }
  };

  // Handler for Join Waitlist button on landing page
  const handleJoinWaitlist = () => {
    setShowLandingPage(false);
  };
  
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
  
  // Render based on application state
  if (showLandingPage) {
    return <LandingPage onJoinWaitlist={handleJoinWaitlist} />;
  }
  
  return (
    <>
      {!walletConnected && <ManualWalletEntry />}
      
      {walletConnected && isRegistering && <UserRegistration />}
      
      {walletConnected && !isRegistering && !selectedCharacter && (
        <CharacterSelection onCharacterSelected={handleCharacterSelected} />
      )}
      
      {walletConnected && !isRegistering && selectedCharacter && (
        <>
          {/* Loading Transition Overlay */}
          {isTransitioning && (
            <div className="loading-transition-overlay">
              <div className="loading-content">
                <div className="cyberpunk-loader"></div>
                <p>Loading Virtual World</p>
              </div>
            </div>
          )}
        
          {/* Show Leaderboard or 3D World */}
          {showLeaderboard ? (
            <LeaderboardPage 
              walletAddress={walletAddress} 
              onReturn={() => handleToggleLeaderboard(false)}
              onFriendUpdate={() => {}}
            />
          ) : (
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
                    // client={client} 
                    characterType={selectedCharacter}
                    walletAddress={walletAddress}
                    onLockChange={handlePointerLockChange}
                  />
                </Canvas>
                <Loader />
              </KeyboardControls>
              
              <SocialMenu 
                walletAddress={walletAddress} 
                isPointerLocked={isPointerLocked}
                onToggleLeaderboard={handleToggleLeaderboard}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

export default App;