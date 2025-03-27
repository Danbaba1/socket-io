import { Request, Response, NextFunction } from 'express';
import { success } from '../lib/helpers';
import passport from 'passport';
import { UserDocument } from '../@api-user/user.model';
import jwt from 'jsonwebtoken'; 
import ms from 'ms';
import dotenv from 'dotenv';
dotenv.config();

// Type-safe JWT signing wrapper with type assertion
function signJwt(
  payload: jwt.JwtPayload | string, 
  secret: string, 
  options?: jwt.SignOptions
): string {
  try {
    // Create a copy of options
    const processedOptions: jwt.SignOptions = { ...options };

    // If expiresIn is a string, convert it
    if (options?.expiresIn) {
      processedOptions.expiresIn = typeof options.expiresIn === 'string'
        ? Math.floor(ms(options.expiresIn) / 1000)
        : options.expiresIn;
    }

    return jwt.sign(payload, secret, {
      ...processedOptions,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('JWT Signing Error:', error);
    throw new Error('Failed to generate token');
  }
}

let response: { [key: string]: unknown } = {};

//---------------------- AUTHENTICATION (SIGNUP AND LOGIN) -------------------------------//

export const signupWithLocalController = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local-signup', { session: false }, 
    (err: Error | null, user: UserDocument | false, info?: { message?: string }) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: info?.message || 'Signup failed'
        });
      }

      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const jwtLifetime = process.env.JWT_LIFETIME || '1d';

      const token = signJwt(
        {
          _id: user._id, 
          email: user.email, 
          role: user.role
        },
        jwtSecret,
        { 
          // Use type assertion to bypass strict type checking
          expiresIn: jwtLifetime as jwt.SignOptions['expiresIn'] 
        }
      );

      response = {
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            email_verified: user.email_verified,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token: token
        },
        message: 'SUCCESS: User local-signup was successful',
      };
      
      success('SUCCESS: User local-signup was successful');
      return res.status(201).json(response);

    } catch (err) {
      next(err);
    }
  })(req, res, next);
}

export const loginWithLocalController = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local-login', { session: false }, 
    (err: Error | null, user: UserDocument | false, info?: { message?: string }) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || 'Login failed'
        });
      }

      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const jwtLifetime = process.env.JWT_LIFETIME || '1d';

      const token = signJwt(
        {
          _id: user._id, 
          email: user.email, 
          role: user.role
        },
        jwtSecret,
        { 
          // Use type assertion to bypass strict type checking
          expiresIn: jwtLifetime as jwt.SignOptions['expiresIn'] 
        }
      );

      response = {
        success: true,
        data: { 
          token: token,
          user: {
            _id: user._id,
            email: user.email,
            role: user.role
          }
        },
        message: 'SUCCESS: User local-login was successful',
      };
      
      success('SUCCESS: User local-login was successful');
      return res.status(200).json(response);

    } catch (err) {
      next(err);
    }
  })(req, res, next);
}
//------------------------------------------------------------------------------------------//
