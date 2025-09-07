import { Router } from 'express';
import authRoutes from './domain/auth/routes';
import userRoutes from './domain/user/routes';

const router = Router();

router.get('/ping', (_req, res) => {
  return res
    .status(200)
    .json({ status: 'pong', timestamp: new Date().toISOString() });
});

authRoutes(router);
userRoutes(router);

export default router;
