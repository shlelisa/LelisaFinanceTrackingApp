"use client";

import { useState, useEffect } from "react";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { useRates } from "@/hooks/useRates";

interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
  showConversion?: boolean;
}

export default function Money({ amount, currency: overrideCurrency, className, showConversion = true }: MoneyProps) {
  const [mounted, setMounted] = useState(false);
  const { currency: preferredCurrency, format } = useAppCurrency();
  const { data: rates } = useRates();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = overrideCurrency || (mounted ? preferredCurrency : "USD");

  if (!mounted || activeCurrency === "ETB" || !rates?.etbRates?.[activeCurrency]) {
    return <span className={className}>{format(amount)}</span>;
  }

  // amount is in ETB, convert to active currency
  const etbPerUnit = rates.etbRates[activeCurrency];
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
