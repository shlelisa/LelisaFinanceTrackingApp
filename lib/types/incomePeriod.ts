export type IncomePeriod = {
  _id: string;
  userId: string;
  amount: number;
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateIncomePeriodInput = {
  amount: number;
  startDate: string;
  endDate: string;
};

export type UpdateIncomePeriodInput = Partial<CreateIncomePeriodInput>;
