import api from "../axios";

export interface UserRateDoc {
  _id: string;
  userId: string;
  from: string;
  to: string;
  rate: number;
}

export const fetchUserRates = (): Promise<UserRateDoc[]> =>
  api.get("/exchange-rates").then((r) => r.data);

export const upsertUserRate = (from: string, to: string, rate: number) =>
  api.post("/exchange-rates", { from, to, rate }).then((r) => r.data);

export const deleteUserRate = (id: string) =>
  api.delete(`/exchange-rates/${id}`).then((r) => r.data);
