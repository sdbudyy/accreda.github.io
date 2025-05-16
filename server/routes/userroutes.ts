import { Router, Request, Response } from 'express';
import { User } from '../models/userModel';

const router = Router();

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

export default router; 