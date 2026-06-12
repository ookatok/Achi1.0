import { z } from 'zod';

export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  topic: z.string().min(1, 'Topic is required'),
  description: z.string().min(1, 'Description is required'),
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;
