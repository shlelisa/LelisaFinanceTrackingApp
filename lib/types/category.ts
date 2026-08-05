export interface CustomCategory {
  _id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  isDefault?: boolean;
  createdAt: string;
}

export type CreateCategoryInput = Omit<CustomCategory, "_id" | "userId" | "createdAt">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
