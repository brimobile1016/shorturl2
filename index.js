const express = require('express');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Load URLs from JSON file
const dataPath = path.join(__dirname, 'data', 'urls.json');

let urls = [];
try {
  const data = fs.readFileSync(dataPath, 'utf8');
  urls = JSON.parse(data);
} catch (err) {
  console.error("Error reading urls.json", err);
}

// Save URLs to JSON file
function saveUrls() {
  fs.writeFileSync(dataPath, JSON.stringify(urls, null, 2), 'utf8');
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to URL Shortener');
});

app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) {
    return res.status(400).json({ error: 'originalUrl is required' });
  }

  const shortUrl = shortid.generate();
  urls.push({ shortUrl, originalUrl });
  saveUrls();

  res.status(201).json({ shortUrl });
});

app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const urlObject = urls.find(url => url.shortUrl === shortUrl);

  if (!urlObject) {
    return res.status(404).json({ error: 'URL not found' });
  }

  res.redirect(urlObject.originalUrl);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
