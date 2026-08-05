export type AccountType = "cash" | "wallet" | "bank" | "credit_card" | "mobile_money";

export interface Account {
  _id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateAccountInput = Omit<Account, "_id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateAccountInput = Partial<CreateAccountInput>;
