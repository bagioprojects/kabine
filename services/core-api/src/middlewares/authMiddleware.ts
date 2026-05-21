import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import { AppDataSource } from '../config/database';
import { User } from '../models/users/User';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_POLITIC_KEY_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.decode(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    if (!decoded || !decoded.sub || decoded.exp < Date.now()) {
      return res.status(401).json({ success: false, message: 'Token has expired or is invalid.' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.sub } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = user;

    // Security check: Block users who haven't completed character creation from other APIs
    if (!user.isCharacterCreated && !user.isAdmin) {
      const allowedPaths = [
        '/users/me',
        '/users/setup-character',
        '/users/update-character-draft'
      ];
      const requestPath = req.originalUrl.split('?')[0].replace(/\/$/, '');
      const isAllowed = allowedPaths.some(path => requestPath.endsWith(path));

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Karakter oluşturma sürecini tamamlamadan bu işleme erişemezsiniz.'
        });
      }
    }

    next();
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
