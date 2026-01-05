import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { authService } from '../services/AuthService';
import { LoginDto, RegisterDto, UpdateUserDto } from '../dtos';
import { validateDto } from '../utils/validation';

export const authRoutes = Router();

// In-memory store for login attempts (use Redis in production)
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt) {
    loginAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Reset if window has passed (15 minutes)
  if (now - attempt.timestamp > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Check if limit exceeded (5 attempts)
  if (attempt.count >= 5) {
    return false;
  }

  // Increment counter
  attempt.count++;
  return true;
};

authRoutes.post('/login', async (req: any, res: Response) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.' 
      });
    }

    const validatedData = await validateDto(LoginDto, req.body);

    const result = await authService.login(validatedData.email, validatedData.password);
    
    // Clear rate limit on successful login
    loginAttempts.delete(clientIp);
    
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
