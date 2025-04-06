import express, { IRouter } from 'express';
import { updateUsernameController, getUserByUsernameController } from './username.controller.js';
import { authenticateUserWithJWT } from '../@api-auth/middlewares/auth.middleware.js';

const router: IRouter = express.Router();

// Protected routes - require authentication
router.put('/update', authenticateUserWithJWT, updateUsernameController);
router.get('/:username', authenticateUserWithJWT, getUserByUsernameController);

export default router;
