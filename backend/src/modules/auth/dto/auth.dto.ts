import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string()
    .email('Invalid email address')
    .refine((val) => val.toLowerCase().endsWith('@gmail.com'), {
      message: 'Only Gmail addresses (@gmail.com) are allowed',
    }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^0[2-9]\d{7,8}$/, {
      message: 'Invalid Thai phone number. Mobile must start with 06/08/09 (10 digits), landline must start with 02-07 (9 digits)',
    }),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
