export const languages = [
  { code: "English", label: "English", nativeLabel: "English", locale: "en" },
  { code: "Amharic", label: "Amharic", nativeLabel: "አማርኛ", locale: "am" },
  { code: "Oromo", label: "Oromo", nativeLabel: "Afaan Oromoo", locale: "om" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const getLocale = (lang: string): string => {
  const found = languages.find((l) => l.code === lang);
  return found?.locale ?? "en";
};
