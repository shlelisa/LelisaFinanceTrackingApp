"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = (checked: boolean) => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
  };

  const u = user as Record<string, string> | null;
  const profileData = [
    { label: "Full Name", value: u?.fullName ?? "Lelisa" },
    { label: "Email", value: u?.email ?? "lelisa@example.com" },
    { label: "Phone", value: u?.phone ?? "+251 911 234 567" },
  ];

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-primary">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary-lighter text-3xl font-bold text-primary">
              L
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {profileData.map((f) => (
                <div key={f.label}>
                  <Label>{f.label}</Label>
                  <Input value={f.value} readOnly />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="default">Edit Profile</Button>
          <Button variant="outline">Change Password</Button>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <Switch checked={dark} onCheckedChange={toggleDark} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Currency</span>
              <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                <option>ETB (Birr)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Language</span>
              <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                <option>English</option>
                <option>Amharic</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline">Export Data</Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete your account?")) {
                logout();
                router.push("/login");
              }
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
