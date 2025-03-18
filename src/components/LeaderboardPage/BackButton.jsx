// src/components/LeaderboardPage/BackButton.jsx
import React from 'react';

const BackButton = ({ onClick }) => {
  return (
    <button className="back-button" onClick={onClick}>
      <span className="back-icon">←</span>
      <span className="back-text">Back</span>
    </button>
  );
};

export default BackButton;