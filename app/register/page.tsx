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
import { useTranslation } from "@/hooks/useTranslation";

const fields: { name: keyof RegisterForm; labelKey: string; type: string }[] = [
  { name: "fullName", labelKey: "auth.full_name", type: "text" },
  { name: "email", labelKey: "auth.email", type: "email" },
  { name: "phone", labelKey: "auth.phone", type: "tel" },
  { name: "password", labelKey: "auth.password", type: "password" },
  { name: "confirmPassword", labelKey: "auth.confirm_password", type: "password" },
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
  const { t } = useTranslation();

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
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-lighter">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary">{t("auth.register")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <Label htmlFor={field.name}>{t(field.labelKey)}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={t(field.labelKey)}
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
              {mutation.isPending ? t("common.submitting") : t("auth.register")}
            </Button>

            {mutation.isError && (
              <p className="text-sm text-error">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : t("auth.something_wrong")}
              </p>
            )}

            {mutation.isSuccess && (
              <p className="text-sm text-success">{t("auth.register_success")}</p>
            )}
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.has_account")}{" "}
            <a href="/login" className="font-medium text-primary hover:underline">
              {t("auth.login")}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
