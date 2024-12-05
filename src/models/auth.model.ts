export type RequestRegister = {
  name: string;
  email: string;
  password: string;
  role: string;
  age: number;
  address: string;
};

export type RequestLogin = {
  email: string;
  password: string;
};

export type RequestLogout = {
  token: string;
};

export type RequestAuthToken = {
  token: string;
};

export type RequestForgotPassword = {
  email: string;
};

export type RequestResetPaswword = {
  token: string;
  password: string;
};
