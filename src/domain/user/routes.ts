import { Router } from 'express';
import { getMyProfile } from './controller';
import { authenticate } from '../auth/middleware';

function userRoutes(router: Router) {
  router.get('/user/profile', authenticate, getMyProfile);
}
export default userRoutes;
