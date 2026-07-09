import type { LoginInput, RegisterForm } from "../types/auth";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateRegisterForm(
  data: RegisterForm
): ValidationErrors<RegisterForm> {
  const errors: ValidationErrors<RegisterForm> = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\+?\d{7,15}$/.test(data.phone.replace(/[\s\-()]/g, ""))) {
    errors.phone = "Invalid phone number";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function validateLoginForm(
  data: LoginInput
): ValidationErrors<LoginInput> {
  const errors: ValidationErrors<LoginInput> = {};

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function hasErrors(
  errors: ValidationErrors<Record<string, unknown>>
): boolean {
  return Object.keys(errors).length > 0;
}
