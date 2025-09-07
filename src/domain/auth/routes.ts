import { Router } from 'express';
import { login, logout, signup } from './controller';

function authRoutes(router: Router) {
  router.post('/auth/signup', signup);
  router.post('/auth/login', login);
  router.get('/auth/logout', logout);
}
export default authRoutes;
