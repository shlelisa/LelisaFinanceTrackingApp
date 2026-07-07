"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useRegister";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterForm } from "@/lib/types/auth";
import {
  validateRegisterForm,
  hasErrors,
  type ValidationErrors,
} from "@/lib/validation/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const fields: { name: keyof RegisterForm; label: string; type: string }[] = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
];

const initialForm: RegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const RegisterPage = () => {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors<RegisterForm>>({});

  const { login } = useAuth();
  const router = useRouter();
  const mutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name as keyof RegisterForm]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    mutation.mutate(form, {
      onSuccess: (data) => {
        login(data.token, data.user);
        router.push("/");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-lighter">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.label}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                />
                {errors[field.name] && (
                  <p className="text-xs text-error">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Register"}
            </Button>

            {mutation.isError && (
              <p className="text-sm text-error">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Something went wrong"}
              </p>
            )}

            {mutation.isSuccess && (
              <p className="text-sm text-success">Registration successful!</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
