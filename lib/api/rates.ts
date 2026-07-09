import api from "../axios";

export interface RatesResponse {
  base: string;
  rates: Record<string, number>;
  etbRates: Record<string, number>;
}

export const fetchRates = (): Promise<RatesResponse> =>
  api.get("/rates").then((r) => r.data);
