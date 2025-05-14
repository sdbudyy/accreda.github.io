require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  // Stripe logic removed. Placeholder response:
  res.json({ message: 'Stripe functionality removed.' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 