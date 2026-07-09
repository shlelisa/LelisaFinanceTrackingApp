"use client";

import { useAppCurrency } from "@/hooks/useAppCurrency";
import { useRates } from "@/hooks/useRates";

interface MoneyProps {
  amount: number;
  className?: string;
  showConversion?: boolean;
}

export default function Money({ amount, className, showConversion = true }: MoneyProps) {
  const { currency, format } = useAppCurrency();
  const { data: rates } = useRates();

  if (currency === "ETB" || !rates?.etbRates?.[currency]) {
    return <span className={className}>{format(amount)}</span>;
  }

  // amount is in ETB, convert to user's preferred currency
  const etbPerUnit = rates.etbRates[currency];
  const converted = Math.round(amount / etbPerUnit);
  const main = format(converted);

  let conversion: string | null = null;
  if (showConversion && amount > 0) {
    conversion = `≈ ${amount.toLocaleString()} ETB`;
  }

  return (
    <span className={className}>
      {main}
      {conversion && (
        <span className="ml-1 text-xs text-muted-foreground">({conversion})</span>
      )}
    </span>
  );
}
