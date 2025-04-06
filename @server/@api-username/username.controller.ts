import { Request, Response, NextFunction } from 'express';
import { usernameService } from './username.service.js';
import { success } from '../lib/helpers/index.js';
import { ReqUser } from '../types/index.js';

export const updateUsernameController = async (req: ReqUser, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    
    const result = await usernameService.addOrUpdateUsername(req.user._id, username);
    
    // Return success response directly instead of using the success helper
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByUsernameController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const user = await usernameService.getUserByUsername(username);
    
    // Return success response directly
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
