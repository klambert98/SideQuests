import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { authService } from '../services/AuthService';
import { LoginDto, RegisterDto, UpdateUserDto } from '../dtos';
import { validateDto } from '../utils/validation';
import { authLimiter } from '../middleware/rateLimiter';

export const authRoutes = Router();

authRoutes.post('/login', authLimiter, async (req: any, res: Response) => {
  try {
    const validatedData = await validateDto(LoginDto, req.body);

    const result = await authService.login(validatedData.email, validatedData.password);
    
    return res.json(result);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
});

authRoutes.get('/me', authenticate, async (req: any, res: Response) => {
  try {
    const user = await authService.getUser(req.userId!);
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

authRoutes.put('/me', authenticate, async (req: any, res: Response) => {
  try {
    const user = await authService.updateUser(req.userId!, req.body);
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

authRoutes.post('/logout', authenticate, (req: any, res: Response) => {
  // Logout is handled client-side by removing the token
  return res.json({ message: 'Logged out successfully' });
});
