import type { LoginInput, RegisterForm } from "../types/auth";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateRegisterForm(
  data: RegisterForm
): ValidationErrors<RegisterForm> {
  const errors: ValidationErrors<RegisterForm> = {};

  if (!data.fullName.trim()) {
    errors.fullName = "validation.full_name_required";
  }

  if (!data.email.trim()) {
    errors.email = "validation.email_required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "validation.email_invalid";
  }

  if (!data.phone.trim()) {
    errors.phone = "validation.phone_required";
  } else if (!/^\+?\d{7,15}$/.test(data.phone.replace(/[\s\-()]/g, ""))) {
    errors.phone = "validation.phone_invalid";
  }

  if (!data.password) {
    errors.password = "validation.password_required";
  } else if (data.password.length < 6) {
    errors.password = "validation.password_min";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "validation.confirm_password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "validation.passwords_match";
  }

  return errors;
}

export function validateLoginForm(
  data: LoginInput
): ValidationErrors<LoginInput> {
  const errors: ValidationErrors<LoginInput> = {};

  if (!data.email.trim()) {
    errors.email = "validation.email_required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "validation.email_invalid";
  }

  if (!data.password) {
    errors.password = "validation.password_required";
  }

  return errors;
}

export function hasErrors(
  errors: ValidationErrors<Record<string, unknown>>
): boolean {
  return Object.keys(errors).length > 0;
}
