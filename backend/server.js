const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/files', fileRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
