import httpStatus from 'http-status';
import { logger } from '../config/logger';
import config from '../config/config';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const errorConverter = (err: Error | GraphQLError | ZodError | Prisma.PrismaClientKnownRequestError) => {
  let error = err;

  if (err instanceof GraphQLError) {
    const message = typeof err.message === 'string' ? err.message : JSON.stringify(err.message);
    error = new ApiError(message, { statusCode: httpStatus.BAD_REQUEST, extensions: { code: err.extensions.code } });
  } else if (err instanceof ApiError) {
    const message = typeof err.message === 'string' ? err.message : JSON.stringify(err.message);
    error = new ApiError(message, { statusCode: err.statusCode, extensions: { code: message } });
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Prisma Error:', err);
    error = handlePrismaError(err);
  } else if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join('.')} - ${issue.message}`).join(', ');
    error = new ApiError(message, { statusCode: httpStatus.BAD_REQUEST, extensions: { code: 'VALIDATION_ERROR' } });
  } else if (err instanceof JsonWebTokenError) {
    const message = 'JWT Access Token is invalid or expired';
    error = new ApiError(message, { statusCode: httpStatus.UNAUTHORIZED, extensions: { code: message } });
  } else if (err instanceof TokenExpiredError) {
    const message = 'JWT Access Token is invalid or expired';
    error = new ApiError(message, { statusCode: httpStatus.UNAUTHORIZED, extensions: { code: message } });
  } else {
    const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    const message =
      typeof error.message === 'string' ? error.message : JSON.stringify(error.message || httpStatus[statusCode]);
    error = new ApiError(message, { statusCode, extensions: { code: 'UNHANDLED_ERROR' } });
  }

  logger.error(`[${new Date().toISOString()}] Error: `, error);
  return error;
};

// Fungsi untuk menangani error Prisma dengan lebih spesifik
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): ApiError => {
  let meta = {};
  switch (err.code) {
    case 'P2002':
      meta = err.meta || {};
      return new ApiError(`Duplicate field value: `, {
        statusCode: httpStatus.BAD_REQUEST,
        extensions: {
          code: meta
        }
      });
    case 'P2014':
      meta = err.meta || {};
      return new ApiError(`Invalid ID: `, {
        statusCode: httpStatus.BAD_REQUEST,
        extensions: {
          code: meta
        }
      });
    case 'P2003':
      meta = err.meta || {};
      return new ApiError(`Invalid input data: `, {
        statusCode: httpStatus.BAD_REQUEST,
        extensions: {
          code: meta
        }
      });
    default:
      meta = err.meta || {};
      return new ApiError(`Something went wrong: `, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        extensions: {
          code: meta
        }
      });
  }
};
