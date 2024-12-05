import httpStatus from 'http-status';
import prisma from '../../prisma/client.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt, { setRandomFallback } from 'bcryptjs';
import { RequestRegister } from '../models/auth.model.js';
import { User } from '@prisma/client';
import { UserType, OptionTypeUsers, RequestUpdateUser } from '../models/user.models.js';

export const createUserServices = async (userBody: RequestRegister) => {
  const hashedPassword = await bcrypt.hash(userBody.password, 10);

  const user = prisma.user.create({
    data: {
      name: userBody.name,
      email: userBody.email,
      password: hashedPassword,
      role: userBody.role,
      age: userBody.age,
      address: userBody.address
    }
  });

  return user;
};

export const getUsersServices = async (option: OptionTypeUsers) => {
  let { size, page, search } = option;
  const sizeAsNumber = parseInt(size, 10);
  const pageAsNumber = parseInt(page, 10);
  const skip = (pageAsNumber - 1) * sizeAsNumber;

  const users = await prisma.user.findMany({
    skip: skip,
    take: sizeAsNumber,
    where: {
      role: {
        contains: search
      }
    },
    orderBy: { name: 'asc' }
  });

  const resultUsers = await prisma.user.count(); // total data keseluruhan
  const totalPage = Math.ceil(resultUsers / sizeAsNumber); //total page

  return { totalPage, totalData: resultUsers, data: users, pageAsNumber };
};

export const getUserByEmailServices = async (email: string) => {
  const user: User | null = await prisma.user.findUnique({
    where: { email }
  });
  return user;
};

export const getUserByIdServices = async (userId: string) => {
  const user: User | null = await prisma.user.findUnique({
    where: { id: userId }
  });
  return user;
};

export const updateUserByIdServices = async (userId: string, updateBody: RequestUpdateUser) => {
  const user = await getUserByIdServices(userId);
  if (!user) {
    throw new ApiError('User not found!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND'
      }
    });
  }

  if (updateBody.email && updateBody.email !== user.email) {
    const isEmailTaken = await prisma.user.findUnique({
      where: { email: updateBody.email }
    });
    if (isEmailTaken) {
      throw new ApiError('Email already taken!', {
        statusCode: httpStatus.BAD_REQUEST,
        extensions: { code: 'BAD_REQUEST' }
      });
    }
  }

  if (updateBody.password) {
    const isPasswordMatch = await bcrypt.compare(updateBody.password, user.password);
    if (!isPasswordMatch) {
      throw new ApiError('Old password is incorrect!', {
        statusCode: httpStatus.UNAUTHORIZED
      });
    }
    updateBody.password = await bcrypt.hash(updateBody.password, 10);
  }

  const updateUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: updateBody
  });

  return updateUser;
};

export const deleteUserByIdServices = async (userId: string) => {
  const user = await getUserByIdServices(userId);
  if (!user) {
    throw new ApiError('User not found!', {
      statusCode: httpStatus.NOT_FOUND,
      extensions: {
        code: 'NOT_FOUND'
      }
    });
  }
  const deleteUser = await prisma.user.delete({
    where: { id: userId }
  });

  return deleteUser;
};
