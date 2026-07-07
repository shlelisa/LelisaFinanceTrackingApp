export type Budget = {
  _id: string;
  userId: string;
  category: string;
  limitAmount: number;
  spent: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
};
