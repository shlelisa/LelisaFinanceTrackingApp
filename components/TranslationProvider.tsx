"use client";

import { NextIntlClientProvider } from "next-intl";
import { useProfile } from "@/hooks/useProfile";
import en from "@/messages/en.json";
import am from "@/messages/am.json";
import om from "@/messages/om.json";
import { getLocale } from "@/lib/i18n";
import type { ReactNode } from "react";

const messagesMap: Record<string, typeof en> = {
  English: en,
  Amharic: am,
  Oromo: om,
};

const getNested = (obj: Record<string, unknown>, path: string): string | undefined => {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
};

export default function TranslationProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const lang = profile?.preferences?.language ?? "English";
  const messages = messagesMap[lang] ?? en;
  const locale = getLocale(lang);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={({ key }) => getNested(en, key) ?? key}
    >
      {children}
    </NextIntlClientProvider>
  );
}
