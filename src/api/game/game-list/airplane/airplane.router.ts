import { Router } from 'express';
import { validateBody } from '../../../../common/middleware';
import { AirplaneController } from './airplane.controller';
import { CreateAirplaneSchema } from './schema';

const airplaneRouter = Router();

airplaneRouter.post(
  '/',
  validateBody({ schema: CreateAirplaneSchema }),
  AirplaneController.create
);

export default airplaneRouter;