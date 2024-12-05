import { z } from 'zod';

export const createUser = z.object({
  name: z.string().min(5, { message: 'Name is required must contain at least 5 characters' }),
  email: z
    .string()
    .email({ message: 'Email must be a valid email address' })
    .refine((email) => email.endsWith('@gmail.com'), { message: 'Email must end with @gmail.com' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((password) => /[A-Za-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: 'Password must contain at least 1 letter, 1 number, and 1 special character'
    }),
  role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Role must be user or admin' }) }),
  age: z.number().positive({ message: 'Age must be a positive number' }),
  address: z.string().min(6, { message: 'Address is required' }) // Sama seperti name
});

export const getUserByEmail = z.object({
  email: z
    .string()
    .email({ message: 'Email must be a valid email address' })
    .refine((email) => email.endsWith('@gmail.com'), { message: 'Email must end with @gmail.com' })
});

export const getUserById = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi, {
    message: '"id" must be a valid UUID'
  })
});

export const updatUserById = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi, {
      message: '"id" must be a valid UUID'
    })
  }),

  body: z.object({
    name: z.string().min(5, { message: 'Name is required must contain at least 5 characters' }).optional(),
    email: z.string().email({ message: 'Email must be a valid email address' }).optional(),
    role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Role must be user or admin' }) }).optional(),
    age: z.number().positive({ message: 'Age must be a positive number' }).optional(),
    address: z.string().min(6, { message: 'Address is required' }).optional(),
    isEmailVerified: z.boolean({ message: 'isEmailVerified must be a boolean' }).default(false).optional()
  })
});

export const deleteUserById = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi, {
    message: '"id" must be a valid UUID'
  })
});
