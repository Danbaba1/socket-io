import { Response } from 'express';
import { CustomErrorInterface, HttpCode } from '../errors/CustomError.js';
import { error } from '../helpers/index.js';

class ErrorHandler {

  public handleError(err: CustomErrorInterface, res: Response): void {
    error(err.message);
    res
     .status(err.status || HttpCode.INTERNAL_SERVER_ERROR)
     .json({
      success: false,
      error: {
        status: err.status || HttpCode.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    });
  }

}

export const errorHandler = new ErrorHandler();
