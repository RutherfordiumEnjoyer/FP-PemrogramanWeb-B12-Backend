import { z } from 'zod';

export const CreateAirplaneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  game_data: z.object({
    questions: z.array(
      z.object({
        question: z.string().min(1, 'Question is required'),
        correctAnswer: z.string().min(1, 'Correct answer is required'),
        wrongAnswers: z
          .array(z.string().min(1))
          .min(1, 'At least 1 wrong answer is required'),
      })
    ).min(1, 'At least 1 question is required'),
    gameSettings: z.object({
        speed: z.enum(['slow', 'normal', 'fast']).optional(),
    }).optional(),
  }),
});

export type ICreateAirplane = z.infer<typeof CreateAirplaneSchema>;