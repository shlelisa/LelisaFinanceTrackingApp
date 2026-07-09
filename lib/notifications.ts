import { toast } from "sonner";

export interface Notification {
  id: string;
  type: "budget_warning" | "budget_exceeded" | "goal_achieved" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = "notifications";

export const getNotifications = (): Notification[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addNotification = (notif: Omit<Notification, "id" | "timestamp" | "read">) => {
  const notification: Notification = {
    ...notif,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  const existing = getNotifications();
  existing.unshift(notification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));

  return notification;
};

export const markAsRead = (id: string) => {
  const notifications = getNotifications();
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifications[idx].read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
};

export const markAllAsRead = () => {
  const notifications = getNotifications();
  notifications.forEach((n) => (n.read = true));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

export const clearNotifications = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const showBudgetAlert = (
  category: string,
  spent: number,
  limit: number,
  t: (key: string, values?: Record<string, unknown>) => string
) => {
  const percentage = (spent / limit) * 100;

  if (percentage >= 100) {
    toast.error(t("alerts.budget_exceeded_title"), {
      description: t("alerts.budget_exceeded_desc", { category, limit, spent }),
    });
    addNotification({
      type: "budget_exceeded",
      title: t("alerts.budget_exceeded_notif_title"),
      message: t("alerts.budget_exceeded_notif_msg", { category, limit, spent }),
    });
  } else if (percentage >= 90) {
    toast.warning(t("alerts.budget_nearly_full_title"), {
      description: t("alerts.budget_nearly_full_desc", {
        category,
        pct: Math.round(percentage),
        spent,
        limit,
      }),
    });
    addNotification({
      type: "budget_warning",
      title: t("alerts.budget_warning_notif_title"),
      message: t("alerts.budget_warning_notif_msg", {
        category,
        pct: Math.round(percentage),
        spent,
        limit,
      }),
    });
  }
};

export const showGoalAchieved = (
  name: string,
  t: (key: string, values?: Record<string, unknown>) => string
) => {
  toast.success(t("alerts.goal_achieved_title"), {
    description: t("alerts.goal_achieved_desc", { name }),
  });
  addNotification({
    type: "goal_achieved",
    title: t("alerts.goal_achieved_notif_title"),
    message: t("alerts.goal_achieved_notif_msg", { name }),
  });
};
