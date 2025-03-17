import React, { useState } from 'react';
import '../styles/CharacterSelection.css';

const characters = [
  { id: 'rpm', name: 'RPM Character', thumbnail: '/thumbnails/michi.jpg' },
  { id: 'anita', name: 'Anita', thumbnail: '/thumbnails/sse.jpg' }
];

export const CharacterSelection = ({ onCharacterSelected }) => {
  const [selectedId, setSelectedId] = useState(null);
  
  const handleSelect = (characterId) => {
    setSelectedId(characterId);
    onCharacterSelected(characterId);
  };

  return (
    <div className="character-selection-overlay">
      <div className="character-selection-container">
        <h2>Choose Your Character</h2>
        <div className="character-grid">
          {characters.map(character => (
            <div 
              key={character.id} 
              className={`character-card ${selectedId === character.id ? 'selected' : ''}`}
              onClick={() => handleSelect(character.id)}
            >
              <img src={character.thumbnail} alt={character.name} />
              <h3>{character.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};