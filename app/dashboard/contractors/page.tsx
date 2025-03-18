"use client";

import { ContractorManagement } from "@/components/settings/contractor-management";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ContractorsPage() {
  const { t } = useTranslations();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("contractors")}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("contractorsDescription")}
        </p>
      </div>

      <ContractorManagement />
    </div>
  );
}
