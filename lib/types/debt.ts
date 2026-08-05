export type DebtType = "borrowed" | "lent" | "loan";

export interface Debt {
  _id: string;
  userId: string;
  type: DebtType;
  person: string;
  totalAmount: number;
  remainingBalance: number;
  currency: string;
  interestRate?: number; // percentage (e.g. 5 for 5%)
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateDebtInput = Omit<Debt, "_id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateDebtInput = Partial<CreateDebtInput>;
