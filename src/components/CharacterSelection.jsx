import React, { useState } from 'react';
import '../styles/CharacterSelection.css';

const characters = [
  { id: 'rpm', name: 'RPM Character', thumbnail: '/thumbnails/michi.jpg' },
  { id: 'anita', name: 'Anita', thumbnail: '/thumbnails/sse.jpg' },
  { id: 'rpmgirl', name: 'RPM Girl', thumbnail: '/thumbnails/rpmgirl.jpg' },
  { id: 'rpmsigma', name: 'Sigma', thumbnail: '/thumbnails/rpmsigma.jpg' },
  { id: 'rpmorangie', name: 'Orangie', thumbnail: '/thumbnails/rpmorangie.jpg' },
  { id: 'rpmcharacter2', name: 'Elon', thumbnail: '/thumbnails/rpmcharacter2.jpg' },
  { id: 'rpmgirl2', name: 'Girl 2', thumbnail: '/thumbnails/rpmgirl2.jpg' },
  { id: 'rpmgirl3', name: 'Girl 3', thumbnail: '/thumbnails/rpmgirl3.jpg' },
  { id: 'rpmgirl4', name: 'Girl 4', thumbnail: '/thumbnails/rpmgirl4.jpg' },
  { id: 'rpmgirl5', name: 'Girl 5', thumbnail: '/thumbnails/rpmgirl5.jpg' },
  { id: 'rpmtrump', name: 'Trump', thumbnail: '/thumbnails/rpmtrump.jpg' },
  { id: 'rpmnig', name: 'African American', thumbnail: '/thumbnails/rpmnig.jpg' }
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