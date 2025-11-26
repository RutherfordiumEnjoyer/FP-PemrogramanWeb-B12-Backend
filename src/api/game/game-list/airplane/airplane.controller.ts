import { NextFunction, Request, Response } from 'express';
import { IAuthUser } from '../../../../common/interface';
import { SuccessResponse } from '../../../../common/response';
import { AirplaneService } from './airplane.service';
import { ICreateAirplane } from './schema';

export class AirplaneController {
  static async create(
    req: Request<{}, {}, ICreateAirplane>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user as IAuthUser;
      const result = await AirplaneService.create(req, user.id);
      
      return new SuccessResponse('Airplane game created successfully', result).send(res);
    } catch (error) {
      next(error);
    }
  }
}