import httpStatus from 'http-status';
import { verifyToken, generateAuthTokens } from './token.services.js';
import { getUserByEmailServices, getUserByIdServices, updateUserByIdServices } from './user.services.js';
import prisma from '../../prisma/client.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';
import { RequestLogin, RequestLogout, RequestAuthToken } from '../models/auth.model.js';
import { TokenTypes } from '../config/token.js';
import { getUserById } from '../validation/user.validation.js';
import { Token } from '@prisma/client';

export const loginServices = async (data: RequestLogin) => {
  const user = await getUserByEmailServices(data.email);

  if (!user) {
    throw new ApiError('wrong email or password!', {
      statusCode: httpStatus.BAD_REQUEST,
      extensions: {
        code: 'BAD_REQUEST'
      }
    });
  }

  if (user.isEmailVerified === false) {
    throw new ApiError('please verify your email!', {
      statusCode: httpStatus.UNAUTHORIZED,
      extensions: {
        code: 'UNAUTHORIZED'
      }
    });
  }

  const validPassword = await bcrypt.compare(data.password, user.password);

  if (!validPassword) {
    throw new ApiError('wrong email or password!', {
      statusCode: httpStatus.BAD_REQUEST,
      extensions: {
        code: 'BAD_REQUEST'
      }
    });
  }
  return user;
};

export const logoutServices = async (token: RequestLogout) => {
  const refreshTokens = await verifyToken(token.token, TokenTypes.REFRESH);

  if (!refreshTokens) {
    throw new ApiError('Token not found, you are logged out!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND!'
      }
    });
  }
  await prisma.token.delete({ where: { id: refreshTokens.id } });
};

export const refreshAuthTokenService = async (refreshToken: RequestAuthToken) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken.token, TokenTypes.REFRESH);

    if (!refreshTokenDoc) {
      throw new ApiError('Token not found', {
        statusCode: httpStatus.NOT_FOUND,
        extensions: {
          code: 'NOT_FOUND'
        }
      });
    }
    const validationUserId = getUserById.parse({ id: refreshTokenDoc.userId });
    const user = await getUserByIdServices(validationUserId.id);

    if (!user) {
      throw new ApiError('User with this token not found!', {
        statusCode: httpStatus.NOT_FOUND,
        extensions: {
          code: 'NOT_FOUND'
        }
      });
    }

    await prisma.token.delete({
      where: { id: refreshTokenDoc.id }
    });
    return generateAuthTokens(user.id);
  } catch (error) {
    throw new ApiError('Please authenticate', {
      statusCode: httpStatus.UNAUTHORIZED,
      extensions: {
        code: 'UNAUTHORIZED!'
      }
    });
  }
};

export const resetPasswordServices = async (resetPasswordToken: string, newPassword: string) => {
  const resetPasswordTokenDoc = await verifyToken(resetPasswordToken, TokenTypes.RESET_PASSWORD);

  if (!resetPasswordTokenDoc) {
    throw new ApiError('Token not found', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND'
      }
    });
  }

  const validationUserId = getUserById.parse({ id: resetPasswordTokenDoc.userId });
  const user = await getUserByIdServices(validationUserId.id);

  if (!user) {
    throw new ApiError('User with this token not found!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND'
      }
    });
  }
  const getRefreshToken = await prisma.token.findFirst({
    where: { userId: user.id, type: TokenTypes.REFRESH }
  });

  if (getRefreshToken) {
    throw new ApiError('You are logged!', {
      statusCode: httpStatus.UNAUTHORIZED,
      extensions: {
        code: 'UNAUTHORIZED'
      }
    });
  }

  await updateUserByIdServices(user.id, { password: newPassword });
  await prisma.token.deleteMany({
    where: { userId: user.id, type: TokenTypes.RESET_PASSWORD }
  });
};

export const verifyEmail = async (verifyEmailToken: string) => {
  const verifyEmailTokenDoc = await verifyToken(verifyEmailToken, TokenTypes.VERIFY_EMAIL);
  if (!verifyEmailTokenDoc) {
    throw new ApiError('Token not found', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND'
      }
    });
  }

  const validationUserId = getUserById.parse({ id: verifyEmailTokenDoc.userId });
  const user = await getUserByIdServices(validationUserId.id);

  if (!user) {
    throw new ApiError('User with this Id not found!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND'
      }
    });
  }
  await prisma.token.deleteMany({
    where: { userId: user.id, type: TokenTypes.VERIFY_EMAIL }
  });
  await updateUserByIdServices(user.id, { isEmailVerified: true });
};
