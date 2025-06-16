const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/files', fileRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
const path = require('path');

// Serve static files from React
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback to index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
