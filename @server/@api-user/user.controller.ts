import { NextFunction, Request, Response } from 'express';
import {
  getOneUserService,
  deleteOneUserService,
  updateOneUserPropertyValueService,
  updateUserPropertyValuesService,
} from './user.service.js';
import { success } from '../lib/helpers/index.js';
import { ReqUser } from '../types/index.js';
import { UserDocument } from '../@api-user/user.model.js'; // Changed from IUser to UserDocument

let response: { [key: string]: unknown } = {};

export const getOneUserController = async (req: ReqUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      throw new Error('User ID is required');
    }
    const user = await getOneUserService(req.user._id);
    if (!user) {
      throw new Error('User not found');
    }
    const response = {
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          email_verified: user.email_verified,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
      message: `SUCCESS: User succesfully retrieved`,
    };
    success(`SUCCESS: User succesfully retrieved`);
    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
}

export const deleteOneUserController = async (req: ReqUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      throw new Error('User ID is required');
    }
    await deleteOneUserService(req.user._id!);
    response = {
      success: true,
      data: {},
      message: `SUCCESS: User successfully deleted`,
    };
    success(`SUCCESS: User successfully deleted`);
    return res.status(201).json(response);

  } catch (err) {
    next(err);
  }
};

export const updateOneUserPropertyValueController = async (req: ReqUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      throw new Error('User ID is required');
    }
    const id: string = req.user._id;
    await updateOneUserPropertyValueService(req.user._id, req.body);
    response = {
      success: true,
      data: {},
      message: `PATCH update request for ID ${id} successful!`,
    };
    success(`PATCH update request for ID ${id} successful!`);
    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
}

export const updateUserPropertyValuesController = async (req: ReqUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      throw new Error('User ID is required');
    }
    const id: string = req.user._id;
    await updateUserPropertyValuesService(req.user._id, req.body);
    response = {
      success: true,
      data: {},
      message: `PUT update request for ID ${id} successful!`,
    };
    success(`PUT update request for ID ${id} successful!`);
    return res.status(200).json(response);

  } catch (err) {
    next(err);
  }
}
