export interface Bill {
  _id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  repeatMonthly: boolean;
  status: "paid" | "unpaid";
  reminderEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBillInput = Omit<Bill, "_id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateBillInput = Partial<CreateBillInput>;
