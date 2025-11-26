import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { prisma } from '../../../../common/config';
import { ICreateAirplane } from './schema';

export class AirplaneService {
  static async create(req: Request<{}, {}, ICreateAirplane>, creatorId: string) {
    const { title, description, game_data } = req.body;
    
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'airplane' },
    });

    if (!template) {
      throw new Error('Game template "airplane" not found.');
    }

    return prisma.games.create({
      data: {
        name: title,
        description,
        thumbnail_image: 'default_image.jpg',
        game_json: game_data as unknown as Prisma.JsonObject,
        creator_id: creatorId,
        game_template_id: template.id,
        is_published: false,
      },
    });
  }
}