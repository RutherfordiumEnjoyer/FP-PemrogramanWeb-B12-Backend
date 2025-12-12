/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import airplaneRouter from './airplane/airplane.router';
import { QuizController } from './quiz/quiz.controller';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/airplane', airplaneRouter);

export default GameListRouter;
