import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../common/config';
import { IAirplaneGameData } from '../../../../common/interface/games/airplane';
import { ErrorResponse } from '../../../../common/response';
import { ICreateAirplane } from './schema/create-airplane.schema';
import { IUpdateAirplane } from './schema/update-airplane.schema';

interface CreateAirplaneParams extends ICreateAirplane {
  thumbnail_image: string;
}

export class AirplaneService {
  
  static async create(data: CreateAirplaneParams, creatorId: string) {
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'airplane' },
    });

    if (!template) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game template "airplane" not found');
    }

    const gameJsonData = data.game_data as unknown as Prisma.JsonObject;

    return prisma.games.create({
      data: {
        name: data.title,
        description: data.description || "",
        thumbnail_image: data.thumbnail_image,
        game_json: gameJsonData,
        creator_id: creatorId,
        game_template_id: template.id,
        is_published: true,
        total_played: 0,
      },
    });
  }

  static async findAll(req: any) {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const template = await prisma.gameTemplates.findUnique({ where: { slug: 'airplane' } });

    const where: Prisma.GamesWhereInput = {
      game_template_id: template?.id,
      name: { contains: search as string, mode: 'insensitive' },
    };

    const [data, total] = await Promise.all([
      prisma.games.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        // Hapus include creator di sini juga kalau bikin error, tapi biasanya findAll butuh nama
        // Kalau error "Unknown field name" muncul di findAll juga, ganti 'name' jadi 'username' atau hapus block include ini.
        // include: { creator: { select: { username: true } } } 
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
      }
    };
  }

  // --- PERBAIKAN UTAMA DI SINI ---
  static async findOne(id: string) {
    const game = await prisma.games.findFirst({
      where: { id },
      // HAPUS include creator karena bikin error dan tidak dipakai di halaman Edit
    });

    if (!game) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');
    }
    return game;
  }

  static async update(id: string, data: IUpdateAirplane, creatorId: string, thumbnailPath?: string) {
    const game = await prisma.games.findFirst({ where: { id, creator_id: creatorId } });
    
    if (!game) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found or you are not the creator');
    }

    const updateData: any = {
      name: data.title,
      description: data.description,
      game_json: data.game_data ? (data.game_data as unknown as IAirplaneGameData) : undefined,
    };

    if (thumbnailPath) {
      updateData.thumbnail_image = thumbnailPath;
    }

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return prisma.games.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string, creatorId: string) {
    const game = await prisma.games.findFirst({ where: { id, creator_id: creatorId } });
    
    if (!game) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found or you are not the creator');
    }

    return prisma.games.delete({
      where: { id },
    });
  }

  static async play(id: string) {
    return prisma.games.update({
      where: { id },
      data: { 
        total_played: { increment: 1 } 
      },
    });
  }
}