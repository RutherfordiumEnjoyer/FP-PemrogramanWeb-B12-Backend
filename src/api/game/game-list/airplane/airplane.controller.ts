import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../../../../common/response';
import { AirplaneService } from './airplane.service';

export class AirplaneController {
  
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const creatorId = user?.user_id || user?.id || user?.sub;
      
      if (!creatorId) {
        throw new ErrorResponse(StatusCodes.UNAUTHORIZED, "Unauthorized: No User ID");
      }

      const thumbnailFile = req.file;
      const thumbnailPath = thumbnailFile ? `uploads/${thumbnailFile.filename}` : 'default_image.jpg';

      const { title, description } = req.body;

      let gameDataPayload;
      try {
        gameDataPayload = typeof req.body.game_data === 'string'
          ? JSON.parse(req.body.game_data)
          : req.body.game_data;
      } catch (e) {
        gameDataPayload = {};
      }

      const result = await AirplaneService.create({
        title,
        description,
        game_data: gameDataPayload,
        thumbnail_image: thumbnailPath,
      }, creatorId);

      res.status(StatusCodes.CREATED).json({ success: true, message: 'Airplane game created successfully', data: result });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(StatusCodes.CONFLICT).json({
          status: false,
          message: 'Game with this title already exists. Please choose another title.'
        });
      }
      next(error); 
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AirplaneService.findAll(req);
      res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error); }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AirplaneService.findOne(req.params.id);
      res.status(StatusCodes.OK).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const creatorId = user?.user_id || user?.id;

      const thumbnailFile = req.file;
      const thumbnailPath = thumbnailFile ? `uploads/${thumbnailFile.filename}` : undefined;

      let gameDataPayload;
      if (req.body.game_data) {
        try {
          gameDataPayload = typeof req.body.game_data === 'string'
            ? JSON.parse(req.body.game_data)
            : req.body.game_data;
        } catch { }
      }

      let isPublished: boolean | undefined;
      if (req.body.is_published !== undefined) {
          isPublished = req.body.is_published === 'true';
      } else if (req.body.is_publish !== undefined) {
          isPublished = req.body.is_publish === 'true';
      }

      const payload = {
        title: req.body.title,
        description: req.body.description,
        game_data: gameDataPayload,
        is_published: isPublished
      };

      const result = await AirplaneService.update(req.params.id, payload, creatorId, thumbnailPath);
      res.status(StatusCodes.OK).json({ success: true, message: 'Game updated successfully', data: result });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const creatorId = user?.user_id || user?.id;

      await AirplaneService.delete(req.params.id, creatorId);
      res.status(StatusCodes.OK).json({ success: true, message: 'Game deleted successfully' });
    } catch (error) { next(error); }
  }

  static async play(req: Request, res: Response, next: NextFunction) {
    try {
      await AirplaneService.play(req.params.id);
      res.status(StatusCodes.OK).json({ success: true, message: 'Play count updated' });
    } catch (error) { next(error); }
  }
}