import { type Prisma } from '@prisma/client';
import { type Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../../../common/config';
import { type IAirplaneGameData } from '../../../../common/interface/games/airplane';
import { ErrorResponse } from '../../../../common/response';
import { type ICreateAirplane } from './schema/create-airplane.schema';
import { type IUpdateAirplane } from './schema/update-airplane.schema';

interface ICreateAirplaneParameters extends ICreateAirplane {
  thumbnail_image: string;
}

export class AirplaneService {
  static async create(data: ICreateAirplaneParameters, creatorId: string) {
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'airplane' },
    });

    if (!template) {
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Game template "airplane" not found',
      );
    }

    const gameJsonData = data.game_data as unknown as Prisma.JsonObject;

    return prisma.games.create({
      data: {
        name: data.title,
        description: data.description || '',
        thumbnail_image: data.thumbnail_image,
        game_json: gameJsonData,
        creator_id: creatorId,
        game_template_id: template.id,
        is_published: true,
        total_played: 0,
      },
    });
  }

  static async findAll(request: Request) {
    const { page = 1, limit = 10, search } = request.query;
    const skip = (Number(page) - 1) * Number(limit);

    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'airplane' },
    });

    const where: Prisma.GamesWhereInput = {
      game_template_id: template?.id,
      deleted_at: null,
      name: { contains: search as string, mode: 'insensitive' },
    };

    const [data, total] = await Promise.all([
      prisma.games.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: { creator: { select: { name: true } } },
      }),
      prisma.games.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        last_page: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async findOne(id: string) {
    const game = await prisma.games.findFirst({
      where: { id, deleted_at: null },
      include: { creator: { select: { name: true } } },
    });

    if (!game) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');
    }

    return game;
  }

  static async update(
    id: string,
    data: IUpdateAirplane,
    creatorId: string,
    thumbnailPath?: string,
  ) {
    const game = await prisma.games.findFirst({
      where: { id, creator_id: creatorId },
    });

    if (!game) {
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Game not found or you are not the creator',
      );
    }

    // Gunakan Record<string, unknown> agar aman saat di-loop
    const updateData: Record<string, unknown> = {
      name: data.title,
      description: data.description,
      game_json: data.game_data
        ? (data.game_data as unknown as IAirplaneGameData)
        : undefined,
    };

    if (thumbnailPath) {
      updateData.thumbnail_image = thumbnailPath;
    }

    // Cleaning undefined values safely
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    return prisma.games.update({
      where: { id },
      // Cast ke any atau Prisma Update Input karena kita sudah membersihkannya
      data: updateData as Prisma.GamesUpdateInput,
    });
  }

  static async delete(id: string, creatorId: string) {
    const game = await prisma.games.findFirst({
      where: { id, creator_id: creatorId },
    });

    if (!game) {
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Game not found or you are not the creator',
      );
    }

    return prisma.games.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  static async play(id: string) {
    return prisma.games.update({
      where: { id },
      data: {
        total_played: { increment: 1 },
      },
    });
  }
}
