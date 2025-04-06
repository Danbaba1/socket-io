import express, { IRouter } from 'express';
import {
  getOneUserController,
  deleteOneUserController,
  updateOneUserPropertyValueController,
  updateUserPropertyValuesController,
} from '../@api-user/user.controller.js';
import { UserRole } from '../@api-user/user.model.js';
import { authenticateUserWithJWT, authorizeByUserRoles } from '../@api-auth/middlewares/auth.middleware.js';

const router: IRouter = express.Router();

router.get('/get-properties', authenticateUserWithJWT, authorizeByUserRoles([UserRole.User]), getOneUserController);

router.patch('/update-any-property', authenticateUserWithJWT, authorizeByUserRoles([UserRole.User]), updateOneUserPropertyValueController);
router.put('/update-properties', authenticateUserWithJWT, authorizeByUserRoles([UserRole.User]), updateUserPropertyValuesController);

router.delete('/delete', authenticateUserWithJWT, authorizeByUserRoles([UserRole.User]), deleteOneUserController);

export default router;
