import { ApiError } from '../../utils/ApiError';
import httpStatus from 'http-status';
import {
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken
} from '../../services/token.services';
import { createUserServices, getUserByEmailServices } from '../../services/user.services';
import {
  loginServices,
  logoutServices,
  refreshAuthTokenService,
  resetPasswordServices,
  verifyEmail
} from '../../services/auth.services';
import { sendResetPasswordEmail, sendVerificationEmail } from '../../services/email.services';
import {
  RequestRegister,
  RequestLogin,
  RequestLogout,
  RequestAuthToken,
  RequestResetPaswword
} from '../../models/auth.model';
import { createUser, getUserByEmail } from '../../validation/user.validation';
import {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verificationEmailToken,
  verificationEmail
} from '../../validation/auth.validation';
import { errorConverter } from '../../middlewares/error';
import { GraphQLError } from 'graphql';
import prisma from '../../../prisma/client';
import { TokenTypes } from '../../config/token';
import { User } from '@prisma/client';

export default {
  Mutation: {
    register: async (parent: unknown, args: RequestRegister) => {
      try {
        const validationEmailUser = getUserByEmail.parse({ email: args.email });
        const existingUser = await getUserByEmailServices(validationEmailUser.email);
        if (existingUser) {
          throw new ApiError('Email already taken, please input different email', {
            statusCode: httpStatus.BAD_REQUEST,
            extensions: {
              code: 'BAD_REQUEST'
            }
          });
        }

        const validationUser = createUser.parse(args);

        const userCreated = await createUserServices(validationUser);

        return {
          message: 'Register is successfully!',
          user: {
            id: userCreated.id,
            name: userCreated.name,
            email: userCreated.email,
            password: userCreated.password,
            role: userCreated.role,
            age: userCreated.age,
            address: userCreated.address,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt,
            isEmailVerified: userCreated.isEmailVerified
          }
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    login: async (parent: unknown, args: RequestLogin) => {
      try {
        const validationEmailUser = getUserByEmail.parse({ email: args.email });
        const existingUser = await getUserByEmailServices(validationEmailUser.email);
        if (!existingUser) {
          throw new ApiError('You dont have an account yet, please register!', {
            statusCode: httpStatus.BAD_REQUEST,
            extensions: {
              code: 'BAD_REQUEST'
            }
          });
        }

        const validationUser = login.parse(args);

        const user = await loginServices(validationUser);
        const existingLoginUser = await prisma.token.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        });

        let tokens;

        if (existingLoginUser) {
          if (existingLoginUser?.blacklisted === false && existingLoginUser.type === 'refresh') {
            throw new ApiError('You are logged!', {
              statusCode: httpStatus.BAD_REQUEST,
              extensions: {
                code: 'BAD_REQUEST'
              }
            });
          } else {
            if (existingLoginUser.type !== 'refresh') {
              tokens = await generateAuthTokens(user.id);
            } else {
              await prisma.token.delete({
                where: {
                  id: existingLoginUser.id,
                  type: TokenTypes.REFRESH
                }
              });
              tokens = await generateAuthTokens(user.id);
            }
          }
        } else {
          tokens = await generateAuthTokens(user.id);
        }

        return {
          message: 'Login is successfully!',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isEmailVerified: user.isEmailVerified
          },
          tokens
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    logout: async (parent: unknown, args: { token: string }) => {
      try {
        const validationLogout = logout.parse(args);
        const tokenData: RequestLogout = { token: validationLogout.token };
        await logoutServices(tokenData);

        return {
          message: 'Logout is successfully!'
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    refreshAuthToken: async (parent: unknown, args: { token: string }) => {
      try {
        const validationRefreshToken = refreshToken.parse({ token: args.token });
        const tokenData: RequestAuthToken = { token: validationRefreshToken.token };
        const tokens = await refreshAuthTokenService(tokenData);

        return {
          message: 'Refresh Token is successfully!',
          tokens
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    forgotPassword: async (parent: unknown, args: { email: string }) => {
      try {
        const validationForgotPassword = forgotPassword.parse({ email: args.email });
        const resetPasswordToken = await generateResetPasswordToken(validationForgotPassword.email);
        await sendResetPasswordEmail(validationForgotPassword.email, resetPasswordToken);

        return {
          message: `Reset password link has been sent to ${validationForgotPassword.email}`,
          tokens: resetPasswordToken
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    resetPassword: async (parent: unknown, args: RequestResetPaswword) => {
      try {
        const validationResetPassword = resetPassword.parse({ password: args.password });
        await resetPasswordServices(args.token, validationResetPassword.password);
        return {
          message: `reset password is succesfully!`
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    sendVerificationEmail: async (parent: unknown, args: User) => {
      try {
        const generateVerifyToken = await generateVerifyEmailToken(args.id);
        const validationVerifyEmailToken = verificationEmailToken.parse({ token: generateVerifyToken });
        await sendVerificationEmail(args.email, validationVerifyEmailToken.token);

        return {
          message: `Verify email link has been sent to ${args.email}`,
          tokens: generateVerifyToken
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    verifyEmail: async (parent: unknown, args: { token: string }) => {
      try {
        const validationVerifyEmail = verificationEmail.parse({ token: args.token });
        await verifyEmail(validationVerifyEmail.token);

        return {
          message: 'Email has been verification!'
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    }
  }
};
