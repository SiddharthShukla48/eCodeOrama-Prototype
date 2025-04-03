const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set MIME type for CSS files
express.static.mime.define({ 'text/css': ['css'] });

// Serve static files from the project root and folders
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
app.use('/scratch-blocks', express.static(path.join(__dirname, 'scratch-blocks')));
app.use('/scratch-vm', express.static(path.join(__dirname, 'scratch-vm')));

app.listen(port, () => {
  console.log(`Scratch Block Renderer running at http://localhost:${port}`);
});
