"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";
import { useAuth } from "@/hooks/useAuth";
import type { LoginInput } from "@/lib/types/auth";
import {
  validateLoginForm,
  hasErrors,
  type ValidationErrors,
} from "@/lib/validation/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const fields: { name: keyof LoginInput; label: string; type: string }[] = [
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Password", type: "password" },
];

const initialForm: LoginInput = { email: "", password: "" };

const LoginPage = () => {
  const [form, setForm] = useState<LoginInput>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors<LoginInput>>({});

  const { login } = useAuth();
  const router = useRouter();
  const mutation = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name as keyof LoginInput]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    mutation.mutate(form, {
      onSuccess: (data) => {
        login(data.token, data.user);
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-lighter">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary">Login</CardTitle>
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
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>

            {mutation.isError && (
              <p className="text-sm text-error">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Invalid credentials"}
              </p>
            )}

            {mutation.isSuccess && (
              <p className="text-sm text-success">Login successful!</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
