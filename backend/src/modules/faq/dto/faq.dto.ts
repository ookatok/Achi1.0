import { z } from 'zod';

export const CreateFaqSchema = z.object({
  questionEn: z.string().min(1, 'English question is required'),
  questionTh: z.string().min(1, 'Thai question is required'),
  answerEn: z.string().min(1, 'English answer is required'),
  answerTh: z.string().min(1, 'Thai answer is required'),
  order: z.number().optional().default(0),
});

export type CreateFaqDto = z.infer<typeof CreateFaqSchema>;
export type UpdateFaqDto = Partial<CreateFaqDto>;
