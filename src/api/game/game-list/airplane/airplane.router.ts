import { Router } from 'express';
import { validateAuth } from '../../../../common/middleware';
// Import upload middleware langsung dari filenya untuk menghindari error index
import { upload } from '../../../../common/middleware/upload.middleware';
import { AirplaneController } from './airplane.controller';

const airplaneRouter = Router();

// GET ALL (Public) - List semua game
airplaneRouter.get('/', AirplaneController.findAll);

// GET ONE (Public) - Detail game
airplaneRouter.get('/:id', AirplaneController.findOne);

// PLAY COUNT (Public) - Increment play count saat tombol exit ditekan
airplaneRouter.post('/:id/play', AirplaneController.play);

// CREATE (Protected + Upload) - Buat game baru
airplaneRouter.post(
  '/',
  validateAuth({}),
  upload.single('thumbnail_image'),
  AirplaneController.create
);

// UPDATE FULL (Protected + Upload) - Edit game (Judul, Deskripsi, Gambar)
airplaneRouter.put(
  '/:id',
  validateAuth({}),
  upload.single('thumbnail_image'),
  AirplaneController.update
);

// UPDATE PARTIAL (Protected + Upload) - Edit status publish atau info parsial
airplaneRouter.patch(
  '/:id',
  validateAuth({}),
  upload.single('thumbnail_image'),
  AirplaneController.update
);

// DELETE (Protected) - Hapus game
airplaneRouter.delete(
  '/:id',
  validateAuth({}),
  AirplaneController.delete
);

export default airplaneRouter;