import { useTranslations } from "next-intl";

export const useTranslation = () => {
  const t = useTranslations();
  return { t };
};
