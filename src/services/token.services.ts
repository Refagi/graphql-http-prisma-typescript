import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import httpStatus from 'http-status';
import config from '../config/config.js';
import { Payload } from '../models/token.model.js';
import { TokenTypes } from '../config/token.js';
import prisma from '../../prisma/client.js';
import { Token, User } from '@prisma/client';
import { getUserByEmailServices, getUserByIdServices } from '../services/user.services';
import { ApiError } from '../utils/ApiError.js';

export const generateToken = async (
  userId: string,
  expires: Moment,
  type: string,
  secret: string = config.jwt.secret
) => {
  const payload: Payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  };
  return jwt.sign(payload, secret);
};

export const saveToken = async (
  token: string,
  userId: string,
  expires: Moment,
  type: string,
  blacklisted: boolean = false
): Promise<Token> => {
  const tokenDoc: Token = await prisma.token.create({
    data: {
      token,
      userId: userId,
      expires: expires.toDate(),
      type,
      blacklisted
    }
  });
  return tokenDoc;
};

export const verifyToken = async (token: string, type: string) => {
  const payload = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
  const tokenDoc = await prisma.token.findFirst({
    where: { token, type, userId: payload.sub as string, blacklisted: false }
  });

  return tokenDoc;
};

export const getPayloadVerifyToken = async (token: string) => {
  const payload = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
  return payload;
};

export const generateAuthTokens = async (userId: string) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = await generateToken(userId, accessTokenExpires, TokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = await generateToken(userId, refreshTokenExpires, TokenTypes.REFRESH);
  await saveToken(refreshToken, userId, refreshTokenExpires, TokenTypes.REFRESH);
  // await saveToken(accessToken, userId, accessTokenExpires, TokenTypes.ACCESS);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate()
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate()
    }
  };
};

export const generateResetPasswordToken = async (email: string) => {
  const user = await getUserByEmailServices(email);
  if (!user) {
    throw new ApiError('No users found with this email!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND!'
      }
    });
  }

  await prisma.token.deleteMany({
    where: {
      userId: user.id,
      type: TokenTypes.RESET_PASSWORD
    }
  });

  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = await generateToken(user.id, expires, TokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, TokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

export const generateVerifyEmailToken = async (userId: string) => {
  const user = await getUserByIdServices(userId);
  if (!user) {
    throw new ApiError('No users found with this Id!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND!'
      }
    });
  }
  await prisma.token.deleteMany({
    where: {
      userId: user.id,
      type: TokenTypes.VERIFY_EMAIL
    }
  });
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = await generateToken(userId, expires, TokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, userId, expires, TokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
