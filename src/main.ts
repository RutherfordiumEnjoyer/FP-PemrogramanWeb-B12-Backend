/* eslint-disable unicorn/prefer-module */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import AppRouter from './api/router';
import { ErrorHandler } from './common';

dotenv.config({ quiet: true });

const uploadPath = path.join(__dirname, '..', 'uploads');
mkdir(uploadPath, { recursive: true });

const app = express();

app.use(
  cors({
    // Izinkan Frontend port 3000 dan 5173 (cadangan)
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/health', (_, response) =>
  response.status(200).json({
    success: true,
    statusCode: StatusCodes.OK,
    message: `🌟 Server is healthy. Current time is ${new Date(Date.now()).toLocaleString('ID-id')}`,
  }),
);

app.use('/uploads', express.static(uploadPath));

app.use('/api', AppRouter);
app.use(ErrorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on Port ${port} 💫`);
});
