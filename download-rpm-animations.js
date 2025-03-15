// download-rpm-fbx-animations.js
const https = require('https');
const fs = require('fs');
const path = require('path');

// Create animations directory
const animationsDir = path.join(__dirname, 'public', 'animations', 'rpm');
if (!fs.existsSync(animationsDir)) {
  fs.mkdirSync(animationsDir, { recursive: true });
  console.log(`Created directory: ${animationsDir}`);
}

// List of animations to download (using the correct GitHub URLs)
const animations = [
  { 
    name: 'idle', 
    url: 'https://github.com/readyplayerme/animation-library/raw/master/masculine/fbx/idle/F_Standing_Idle_Variations_005.fbx' 
  },
  { 
    name: 'talking', 
    url: 'https://github.com/readyplayerme/animation-library/raw/master/masculine/fbx/expression/M_Standing_Expressions_011.fbx' 
  },
  { 
    name: 'dance', 
    url: 'https://github.com/readyplayerme/animation-library/raw/master/masculine/fbx/dance/F_Dances_004.fbx' 
  }
];

// Download each animation
animations.forEach(animation => {
  const outputPath = path.join(animationsDir, `${animation.name}.fbx`);
  console.log(`Downloading ${animation.name} from: ${animation.url}`);
  
  const fileStream = fs.createWriteStream(outputPath);
  
  https.get(animation.url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download animation: ${response.statusCode} ${response.statusMessage}`);
      fileStream.close();
      fs.unlinkSync(outputPath);
      return;
    }
    
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Successfully downloaded ${animation.name}!`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${animation.name}: ${err.message}`);
    fileStream.close();
    fs.unlinkSync(outputPath);
  });
});