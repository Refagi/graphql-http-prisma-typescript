import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Menggunakan __dirname

// Define Zod schema
const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().trim().min(1, { message: 'DATABASE_URL is required' }),
  JWT_SECRET: z.string().trim().min(1, { message: 'JWT_SECRET is required' }),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce.number().default(10),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce.number().default(10),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USERNAME: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional()
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Environment variables validation failed:', parsedEnv.error.format());
  throw new Error('Invalid environment variables');
}

// Extract validated environment variables
const envVars = parsedEnv.data;

// Config object
export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE_URL + (envVars.NODE_ENV === 'test' ? '-test' : '')
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD
      }
    },
    from: envVars.EMAIL_FROM
  }
};
