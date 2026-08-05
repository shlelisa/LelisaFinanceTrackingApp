import {
  getStoredExchangeRates,
  saveStoredExchangeRate,
  deleteStoredExchangeRate,
  type ExchangeRateDoc,
} from "../storage/localStorage";

export type UserRateDoc = ExchangeRateDoc;

export const fetchUserRates = async (): Promise<UserRateDoc[]> => {
  return getStoredExchangeRates();
};

export const upsertUserRate = async (from: string, to: string, rate: number): Promise<UserRateDoc> => {
  return saveStoredExchangeRate(from, to, rate);
};

export const deleteUserRate = async (id: string): Promise<{ message: string }> => {
  deleteStoredExchangeRate(id);
  return { message: "Rate deleted" };
};
