require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Placeholder for root path or other routes
app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 