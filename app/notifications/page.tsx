"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2, CheckCheck, AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  type Notification,
} from "@/lib/notifications";

const iconMap: Record<string, React.ReactNode> = {
  budget_exceeded: <AlertCircle className="size-5 text-red-500" />,
  budget_warning: <AlertTriangle className="size-5 text-yellow-500" />,
  goal_achieved: <CheckCircle2 className="size-5 text-green-500" />,
  info: <Info className="size-5 text-blue-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = () => setNotifications(getNotifications());

  useEffect(() => {
    refresh();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold text-primary">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default">{unreadCount} unread</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => { markAllAsRead(); refresh(); }}>
                <CheckCheck className="mr-1 size-4" /> Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { clearNotifications(); refresh(); }}>
                <Trash2 className="mr-1 size-4" /> Clear all
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
            <BellOff className="size-12" />
            <p className="text-lg">No notifications yet</p>
            <p>Notifications about budgets, goals, and more will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${!notif.read ? "border-l-4 border-l-primary" : "opacity-70"}`}
                onClick={() => { markAsRead(notif.id); refresh(); }}
              >
                <CardHeader className="flex flex-row items-center gap-3 py-3">
                  {iconMap[notif.type] || <Info className="size-5 text-blue-500" />}
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{notif.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && <div className="size-2 rounded-full bg-primary" />}
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
