const https = require('https');
const fs = require('fs');
const path = require('path');

// URL of the Ready Player Me model
const modelUrl = 'https://models.readyplayer.me/67de61b055c6887bf45aca14.glb?morphTargets=ARKit,Oculus%20Visemes';

// Path where the model should be saved
const outputPath = path.join(__dirname, 'public', 'models', 'rpmmale1.glb');

// Ensure the directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Created directory: ${dir}`);
}

console.log(`Downloading model from: ${modelUrl}`);
console.log(`Saving to: ${outputPath}`);

// Create a file stream to save the model
const fileStream = fs.createWriteStream(outputPath);

// Download the model
https.get(modelUrl, (response) => {
  // Check if the request was successful
  if (response.statusCode !== 200) {
    console.error(`Failed to download model: ${response.statusCode} ${response.statusMessage}`);
    fileStream.close();
    fs.unlinkSync(outputPath); // Remove the file if download failed
    return;
  }

  // Pipe the response data to the file
  response.pipe(fileStream);

  // Handle download completion
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Download completed successfully!');
  });
}).on('error', (err) => {
  console.error(`Error during download: ${err.message}`);
  fileStream.close();
  fs.unlinkSync(outputPath); // Remove the file if download failed
});