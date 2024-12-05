import { ApiError } from '../../utils/ApiError';
import httpStatus from 'http-status';
import {
  createUserServices,
  getUserByEmailServices,
  getUserByIdServices,
  getUsersServices,
  updateUserByIdServices,
  deleteUserByIdServices
} from '../../services/user.services';
import { errorConverter } from '../../middlewares/error';
import { GraphQLError } from 'graphql';
import prisma from '../../../prisma/client';
import { User } from '@prisma/client';
import { RequestCreateUser, OptionTypeUsers, RequestUpdateUser } from '../../models/user.models';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updatUserById,
  deleteUserById
} from '../../validation/user.validation';
import { requiredRights } from '../../middlewares/auth';
import { getPayloadVerifyToken } from '../../services/token.services';

export default {
  Mutation: {
    createUser: async (parent: unknown, args: RequestCreateUser, context: any) => {
      const authorization = context.authHeader?.authorization.split(' ')[1];
      try {
        const decoded = await getPayloadVerifyToken(authorization);
        console.log('payload: ', decoded);
        if (!decoded) {
          throw new ApiError('Invalid token', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
        const isUserLogin = await prisma.user.findFirst({
          where: { id: decoded.sub }
        });
        if (!isUserLogin) {
          throw new ApiError('User with this token not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: { code: 'NOT_FOUND' }
          });
        }
        const isValidAccess = await requiredRights(['manageUsers'], isUserLogin.role);
        console.log('valid access', isValidAccess);
        if (isValidAccess === false) {
          throw new ApiError('Access danied!', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: {
              code: 'Forrbidden!'
            }
          });
        }
        const validationCreateUser = createUser.parse(args);
        const userCreated = await createUserServices(validationCreateUser);
        return {
          message: 'Create User is successfully!',
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

    updateUserById: async (parent: unknown, args: { id: string; user: RequestUpdateUser }, context: any) => {
      const authorization = context.authHeader?.authorization.split(' ')[1];
      try {
        const decoded = await getPayloadVerifyToken(authorization);
        if (!decoded) {
          throw new ApiError('Invalid token', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
        const isUserLogin = await prisma.user.findFirst({
          where: { id: decoded.sub }
        });
        if (!isUserLogin) {
          throw new ApiError('User with this token not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: { code: 'NOT_FOUND' }
          });
        }
        const isValidAccess = await requiredRights(['manageUsers'], isUserLogin.role);
        if (isValidAccess === false) {
          throw new ApiError('Access danied: You do not have permission to access this resource', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: {
              code: 'Forrbidden'
            }
          });
        }

        const validationUpdateUser = updatUserById.parse({ params: { id: args.id }, body: args.user });
        const updateUser = await updateUserByIdServices(validationUpdateUser.params.id, validationUpdateUser.body);
        if (!updateUser) {
          throw new ApiError('failed to update user!', {
            statusCode: httpStatus.BAD_REQUEST,
            extensions: {
              code: 'BAD_REQUEST'
            }
          });
        }

        return {
          message: 'Update user by id is successfully!',
          user: {
            id: updateUser.id,
            name: updateUser.name,
            email: updateUser.email,
            password: updateUser.password,
            role: updateUser.role,
            age: updateUser.age,
            address: updateUser.address,
            createdAt: updateUser.createdAt,
            updatedAt: updateUser.updatedAt,
            isEmailVerified: updateUser.isEmailVerified
          }
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    deleteUserById: async (parent: unknown, args: { id: string }, context: any) => {
      const authorization = context.authHeader?.authorization.split(' ')[1];
      try {
        const decoded = await getPayloadVerifyToken(authorization);
        if (!decoded) {
          throw new ApiError('Invalid token', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
        const isUserLogin = await prisma.user.findFirst({
          where: { id: decoded.sub }
        });
        if (!isUserLogin) {
          throw new ApiError('User with this token not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: { code: 'NOT_FOUND' }
          });
        }
        const isValidAccess = await requiredRights(['manageUsers'], isUserLogin.role);
        if (isValidAccess === false) {
          throw new ApiError('Access danied: You do not have permission to access this resource', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: {
              code: 'Forrbidden'
            }
          });
        }
        const validationDeleteUserById = deleteUserById.parse({ id: args.id });
        const deletUser = await deleteUserByIdServices(validationDeleteUserById.id);
        if (!deletUser) {
          throw new ApiError('failed to delete user!', {
            statusCode: httpStatus.BAD_REQUEST,
            extensions: {
              code: 'BAD_REQUEST'
            }
          });
        }
        return {
          message: 'Deleted user by id is successfully!',
          user: {
            id: deletUser.id,
            name: deletUser.name,
            email: deletUser.email,
            password: deletUser.password,
            role: deletUser.role,
            age: deletUser.age,
            address: deletUser.address,
            createdAt: deletUser.createdAt,
            updatedAt: deletUser.updatedAt,
            isEmailVerified: deletUser.isEmailVerified
          }
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    }
  },

  Query: {
    getUserById: async (parent: unknown, args: { id: string }, context: any) => {
      const authorization = context.authHeader?.authorization.split(' ')[1];
      try {
        const decoded = await getPayloadVerifyToken(authorization);
        if (!decoded) {
          throw new ApiError('Invalid token', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
        const isUserLogin = await prisma.user.findFirst({
          where: { id: decoded.sub }
        });
        if (!isUserLogin) {
          throw new ApiError('User with this token not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: { code: 'NOT_FOUND' }
          });
        }
        const isValidAccess = await requiredRights(['getUser'], isUserLogin.role);
        if (isValidAccess === false) {
          throw new ApiError('Access danied!', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: {
              code: 'Forrbidden!'
            }
          });
        }
        const validationGetUserById = getUserById.parse({ id: args.id });
        const getUser = await getUserByIdServices(validationGetUserById.id);
        if (!getUser) {
          throw new ApiError('User not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: {
              code: 'NOT_FOUND'
            }
          });
        }
        return {
          message: 'Get user by id is successfully',
          user: {
            id: getUser.id,
            name: getUser.name,
            email: getUser.email,
            password: getUser.password,
            role: getUser.role,
            age: getUser.age,
            address: getUser.address,
            createdAt: getUser.createdAt,
            updatedAt: getUser.updatedAt,
            isEmailVerified: getUser.isEmailVerified
          }
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    getUserByEmail: async (parent: unknown, args: { email: string }, context: any) => {
      const authorization = context.authHeader?.authorization.split(' ')[1];
      try {
        const decoded = await getPayloadVerifyToken(authorization);
        if (!decoded) {
          throw new ApiError('Invalid token', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
        const isUserLogin = await prisma.user.findFirst({
          where: { id: decoded.sub }
        });
        if (!isUserLogin) {
          throw new ApiError('User with this token not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: { code: 'NOT_FOUND' }
          });
        }
        const isValidAccess = await requiredRights(['manageUsers'], isUserLogin.role);
        if (isValidAccess === false) {
          throw new ApiError('Access danied!', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: {
              code: 'Forrbidden!'
            }
          });
        }
        const validationGetUserById = getUserByEmail.parse({ email: args.email });
        const getUser = await getUserByEmailServices(validationGetUserById.email);
        console.log('user: ', getUser);
        if (!getUser) {
          throw new ApiError('User not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: {
              code: 'NOT_FOUND'
            }
          });
        }
        return {
          message: 'Get user by Email is successfully',
          user: {
            id: getUser.id,
            name: getUser.name,
            email: getUser.email,
            password: getUser.password,
            role: getUser.role,
            age: getUser.age,
            address: getUser.address,
            createdAt: getUser.createdAt,
            updatedAt: getUser.updatedAt,
            isEmailVerified: getUser.isEmailVerified
          }
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    },

    getUsers: async (parent: unknown, args: OptionTypeUsers, context: any) => {
      const authorization = context.authHeader?.authorization.split(' ')[1];
      try {
        const decoded = await getPayloadVerifyToken(authorization);
        if (!decoded) {
          throw new ApiError('Invalid token', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
        const isUserLogin = await prisma.user.findFirst({
          where: { id: decoded.sub }
        });
        if (!isUserLogin) {
          throw new ApiError('User with this token not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: { code: 'NOT_FOUND' }
          });
        }
        const isValidAccess = await requiredRights(['getUsers'], isUserLogin.role);
        if (isValidAccess === false) {
          throw new ApiError('Access danied!', {
            statusCode: httpStatus.FORBIDDEN,
            extensions: {
              code: 'Forrbidden!'
            }
          });
        }
        const paginationUser = await getUsersServices(args);
        console.log('users: ', paginationUser);
        if (!paginationUser) {
          throw new ApiError('User not found!', {
            statusCode: httpStatus.NOT_FOUND,
            extensions: {
              code: 'NOT_FOUND'
            }
          });
        }
        return {
          message: 'Get users is successfully',
          currentPage: paginationUser.pageAsNumber,
          totalData: paginationUser.totalData,
          totalPage: paginationUser.totalPage,
          user: paginationUser.data
        };
      } catch (err) {
        // Konversi error menggunakan errorConverter
        const error = errorConverter(err as GraphQLError);
        throw error;
      }
    }
  }
};
