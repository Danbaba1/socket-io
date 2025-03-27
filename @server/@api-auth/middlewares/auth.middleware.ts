import { NextFunction, Response } from "express";
import passport from 'passport';
import { Types } from 'mongoose';
import { Payload, ReqUser } from '../../types';
import { UserRole } from "../../@api-user/user.model";
import { unAuthorizedErr } from '../../lib/errors/Errors';

// -----------------------------------------------------------------------------------------------------------//
// https://www.sailpoint.com/identity-library/difference-between-authentication-and-authorization/
// AUTHENTICATION is the process of verifying who someone is (This is done during SIGNUP, LOGIN, and JWT)
// AUTHORIZATION is the process of verifying what specific applications, files, and data a user 
//               has access to (Usually by ROLES)
// -----------------------------------------------------------------------------------------------------------//

export const authenticateUserWithJWT = (req: ReqUser, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', {session: false},
    (err: Error, payload: Payload, info: { message: string }) => {
      try {
        if (err) {
        throw err
        }
        if (info) {
          unAuthorizedErr(info.message)
        }
        if (!payload) {
          unAuthorizedErr("[UNAUTHORIZED] Unknown User Trying to Access This Route\nRedirecting To Login Page")
        }
        const _id = payload._id instanceof Types.ObjectId 
          ? payload._id.toString() 
          : payload._id;

        req.user = { 
          _id, 
          email: payload.email, 
          role: payload.role 
        };
        return next();
        
      } catch (err) {
        next(err);
      }
    }
  )(req, res, next);
}


export const authorizeByUserRoles = (allowedRoles: UserRole[]) => {
  return (req: ReqUser, res: Response, next: NextFunction) => {
    try {

      if (!req.user?.role) {
        unAuthorizedErr("Unauthorized: No user role found");
        return;
      }

      const { role } = req.user;
      const roleIsVerified = allowedRoles.includes(role);
      if (roleIsVerified) {
        return next();
      }
      unAuthorizedErr("Unauthorized: Can't access this resource");

    } catch (err) {
      next(err)
    }
  }
}
