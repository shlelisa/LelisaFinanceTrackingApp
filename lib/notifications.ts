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

export const showBudgetAlert = (category: string, spent: number, limit: number) => {
  const percentage = (spent / limit) * 100;

  if (percentage >= 100) {
    toast.error(`Budget exceeded!`, {
      description: `${category} budget of ${limit.toLocaleString()} fully used (${spent.toLocaleString()} spent).`,
    });
    addNotification({
      type: "budget_exceeded",
      title: "Budget Exceeded",
      message: `${category} budget of ${limit.toLocaleString()} has been exceeded. Spent: ${spent.toLocaleString()}.`,
    });
  } else if (percentage >= 90) {
    toast.warning(`Budget nearly full`, {
      description: `${category} budget is ${Math.round(percentage)}% used (${spent.toLocaleString()} / ${limit.toLocaleString()}).`,
    });
    addNotification({
      type: "budget_warning",
      title: "Budget Warning",
      message: `${category} budget is ${Math.round(percentage)}% used (${spent.toLocaleString()} / ${limit.toLocaleString()}).`,
    });
  }
};

export const showGoalAchieved = (name: string) => {
  toast.success(`Goal achieved!`, {
    description: `Congratulations! You reached your "${name}" savings goal.`,
  });
  addNotification({
    type: "goal_achieved",
    title: "Goal Achieved",
    message: `Congratulations! You reached your "${name}" savings goal.`,
  });
};
