export interface UserType {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  age?: number;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isEmailVerified?: boolean;
}

export interface OptionTypeUsers {
  page: string;
  size: string;
  search: string;
}

export interface RequestCreateUser {
  name: string;
  email: string;
  password: string;
  role: string;
  age: number;
  address: string;
}

export interface RequestUpdateUser {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  age?: number;
  address?: string;
  isEmailVerified?: boolean;
}
