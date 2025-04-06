import { Request, Response, NextFunction } from 'express';
import { success } from '../lib/helpers/index.js';
import passport from 'passport';
import { UserDocument } from '../@api-user/user.model.js';
import jwt from 'jsonwebtoken'; 
import ms from 'ms';
import dotenv from 'dotenv';
import { logger } from '../server.js'; // Import the logger

dotenv.config();

// Type-safe JWT signing wrapper with type assertion
function signJwt(
  payload: jwt.JwtPayload | string, 
  secret: string, 
  options?: jwt.SignOptions
): string {
  try {
    logger.debug('AUTH', 'Generating JWT token', { 
      userId: typeof payload === 'object' ? payload._id : 'unknown',
      expiresIn: options?.expiresIn 
    });
    
    let processedOptions = { ...options };
    if (options?.expiresIn && typeof options.expiresIn === 'string') {
      const seconds = Math.floor(ms(options.expiresIn) / 1000);
      processedOptions.expiresIn = seconds;
      logger.debug('AUTH', 'Converted expiresIn to seconds', { 
        original: options.expiresIn, 
        seconds 
      });
    }

    const token = jwt.sign(payload, secret, {
      ...processedOptions,
      algorithm: 'HS256'
    });
    
    logger.debug('AUTH', 'JWT token generated successfully');
    return token;
  } catch (error) {
    logger.error('AUTH', 'JWT Signing Error:', error);
    throw new Error('Failed to generate token');
  }
}

let response: { [key: string]: unknown } = {};

//---------------------- AUTHENTICATION (SIGNUP AND LOGIN) -------------------------------//

export const signupWithLocalController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('AUTH', 'Processing signup request', { 
    email: req.body.email,
    ipAddress: req.ip 
  });
  
  passport.authenticate('local-signup', { session: false }, 
    (err: Error | null, user: UserDocument | false, info?: { message?: string }) => {
    try {
      if (err) {
        logger.error('AUTH', 'Signup error in passport authentication', err);
        return next(err);
      }

      if (!user) {
        logger.warn('AUTH', 'Signup failed - invalid credentials or user exists', { 
          message: info?.message 
        });
        return res.status(400).json({
          success: false,
          message: info?.message || 'Signup failed'
        });
      }

      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        logger.error('AUTH', 'JWT_SECRET is not defined in environment variables', '');
        throw new Error('JWT_SECRET is not defined');
      }

      const jwtLifetime = process.env.JWT_LIFETIME || '1d';
      logger.debug('AUTH', 'Using JWT lifetime', { lifetime: jwtLifetime });

      const token = signJwt(
        {
          _id: user._id, 
          username: user.username,
          email: user.email, 
          role: user.role
        },
        jwtSecret,
        { 
          expiresIn: jwtLifetime as jwt.SignOptions['expiresIn'] 
        }
      );

      response = {
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            username: user.username,
            email_verified: user.email_verified,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token: token
        },
        message: 'SUCCESS: User local-signup was successful',
      };
      
      logger.info('AUTH', 'User signup successful', { 
        userId: user._id,
        email: user.email 
      });
      success('SUCCESS: User local-signup was successful');
      return res.status(201).json(response);

    } catch (err) {
      logger.error('AUTH', 'Error in signup process', err);
      next(err);
    }
  })(req, res, next);
}

export const loginWithLocalController = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('AUTH', 'Processing login request', { 
    email: req.body.email,
    ipAddress: req.ip 
  });
  
  passport.authenticate('local-login', { session: false }, 
    (err: Error | null, user: UserDocument | false, info?: { message?: string }) => {
    try {
      if (err) {
        logger.error('AUTH', 'Login error in passport authentication', err);
        return next(err);
      }

      if (!user) {
        logger.warn('AUTH', 'Login failed - invalid credentials', { 
          message: info?.message,
          email: req.body.email
        });
        return res.status(401).json({
          success: false,
          message: info?.message || 'Login failed'
        });
      }

      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        logger.error('AUTH', 'JWT_SECRET is not defined in environment variables', '');
        throw new Error('JWT_SECRET is not defined');
      }

      const jwtLifetime = process.env.JWT_LIFETIME || '1d';
      logger.debug('AUTH', 'Using JWT lifetime', { lifetime: jwtLifetime });

      const token = signJwt(
        {
          _id: user._id, 
          email: user.email, 
          username: user.username,
          role: user.role
        },
        jwtSecret,
        { 
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
            username: user.username,
            role: user.role
          }
        },
        message: 'SUCCESS: User local-login was successful',
      };
      
      logger.info('AUTH', 'User login successful', { 
        userId: user._id,
        email: user.email 
      });
      success('SUCCESS: User local-login was successful');
      return res.status(200).json(response);

    } catch (err) {
      logger.error('AUTH', 'Error in login process', err);
      next(err);
    }
  })(req, res, next);
}
