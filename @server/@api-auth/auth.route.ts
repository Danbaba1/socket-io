import express, { IRouter } from 'express';
import {
  signupWithLocalController,
  loginWithLocalController,
} from './auth.controller';

const router: IRouter = express.Router();

router.post('/signup', signupWithLocalController);
router.post('/login', loginWithLocalController);

export default router;
