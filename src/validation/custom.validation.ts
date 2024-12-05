import { z } from 'zod';

// Validasi UUID
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi, {
    message: '"id" must be a valid UUID'
  });

// Validasi Password
export const password = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/\d/, { message: 'Password must contain at least 1 number' })
  .regex(/[a-zA-Z]/, { message: 'Password must contain at least 1 letter' })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least 1 special character' });

// Validasi Nomor Telepon
export const phoneNumber = z
  .string()
  .regex(/^(?:\+62)[2-9]\d{8,11}$/, { message: 'Phone number must be a valid Indonesia phone number' });
