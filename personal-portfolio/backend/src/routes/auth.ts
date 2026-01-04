import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { authService } from '../services/AuthService';

export const authRoutes = Router();

authRoutes.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await authService.login(email, password);
    return res.json(result);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
});

authRoutes.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getUser(req.userId!);
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

authRoutes.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.updateUser(req.userId!, req.body);
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

authRoutes.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  // Logout is handled client-side by removing the token
  return res.json({ message: 'Logged out successfully' });
});
