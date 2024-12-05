import { z } from 'zod';

export const register = z.object({
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

export const login = z.object({
  email: z
    .string()
    .email({ message: 'Email must be a valid email address' })
    .refine((email) => email.endsWith('@gmail.com'), { message: 'Email must end with @gmail.com' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((password) => /[A-Za-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: 'Password must contain at least 1 letter, 1 number, and 1 special character'
    })
});

export const logout = z.object({
  token: z.string().min(1, { message: 'refresh token must exist!' })
});

export const refreshToken = z.object({
  token: z.string().min(1, { message: 'refresh token must exist!' })
});

export const forgotPassword = z.object({
  email: z
    .string()
    .email({ message: 'Email must be a valid email address' })
    .refine((email) => email.endsWith('@gmail.com'), { message: 'Email must end with @gmail.com' })
});

export const resetPassword = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((password) => /[A-Za-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: 'Password must contain at least 1 letter, 1 number, and 1 special character'
    })
});

export const verificationEmailToken = z.object({
  token: z.string().min(1, { message: 'verify token must exist!' })
});

export const verificationEmail = z.object({
  token: z.string().min(1, { message: 'verify token must exist!' })
});
