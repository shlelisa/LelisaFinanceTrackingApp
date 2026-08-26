export type SalaryConfig = {
  userId: string;
  amount: number;
  /** Day of the month (1-31) the salary is credited; clamped to shorter months */
  paymentDay: number;
  currency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveSalaryInput = {
  amount: number;
  paymentDay: number;
};
