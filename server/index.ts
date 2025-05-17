import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Waitlist endpoint
app.post('/api/waitlist', async (req: Request, res: Response) => {
  const { email, province } = req.body;
  if (!email || !province) {
    return res.status(400).json({ error: 'Email and province are required.' });
  }
  const { error } = await supabase.from('waitlist').insert([{ email, province }]);
  if (error) {
    console.error('Supabase insert error:', error);
    console.error('Request body:', req.body);
    if (error.code === '23505' || (error.message && error.message.includes('duplicate key value'))) {
      return res.status(409).json({ error: 'This email is already on the waitlist.' });
    }
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

// Serve static files from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../dist');
  app.use(express.static(buildPath));
  // Serve index.html for any non-API route
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 