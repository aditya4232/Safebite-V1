// Simple Express server that forwards requests to the actual server
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Check if server directory exists
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('Server directory not found at:', serverDir);
  process.exit(1);
}

// Start the actual server as a child process
console.log('Starting server from directory:', serverDir);
const serverProcess = exec('cd server && npm install && npm start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting server: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Server stderr: ${stderr}`);
  }
  console.log(`Server stdout: ${stdout}`);
});

// Forward all requests to the actual server
app.all('*', (req, res) => {
  res.status(200).send('Server is starting. Please wait a moment and refresh the page.');
});

// Start the proxy server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});
