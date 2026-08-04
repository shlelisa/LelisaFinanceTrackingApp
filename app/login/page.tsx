"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";
import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";

const initialForm: LoginInput = { email: "", password: "" };

const LoginPage = () => {
  const [form, setForm] = useState<LoginInput>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors<LoginInput>>({});
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const mutation = useLogin();
  const { t } = useTranslation();

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
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light font-black text-white text-2xl shadow-lg shadow-primary/20">
            L
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t("auth.login")} to LelisaFin
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Manage your personal finances, budgets, and savings offline securely.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border shadow-lg backdrop-blur-md bg-card/90 rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("auth.email")}
                </Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-9 h-11 text-sm rounded-xl"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("auth.password")}
                  </Label>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="pl-9 pr-10 h-11 text-sm rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error font-medium">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="mt-2 h-11 w-full rounded-xl text-sm font-semibold shadow-md gap-2"
              >
                {mutation.isPending ? (
                  t("common.logging_in")
                ) : (
                  <>
                    <LogIn className="size-4" />
                    {t("auth.login")}
                  </>
                )}
              </Button>

              {mutation.isError && (
                <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : t("auth.invalid_credentials")}
                </div>
              )}

              {mutation.isSuccess && (
                <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
                  {t("auth.login_success")}
                </div>
              )}
            </form>

            <div className="mt-6 border-t pt-4 text-center text-sm text-muted-foreground">
              {t("auth.no_account")}{" "}
              <Link
                href="/register"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                {t("auth.register")} <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
