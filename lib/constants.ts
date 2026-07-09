export const CATEGORIES = [
  "Income",
  "Food",
  "Travel",
  "HouseRent",
  "MobileData",
  "Entertainment",
  "Other",
] as const;

export const CURRENCIES = ["ETB", "USD", "EUR", "GBP"] as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
