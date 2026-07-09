import type { User } from "./api";

export type RegisterInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterForm = RegisterInput & {
  confirmPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type { User };
