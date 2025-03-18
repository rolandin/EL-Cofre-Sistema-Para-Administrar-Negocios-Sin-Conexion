"use client";

import { useState } from "react";
import { ReturnForm } from "@/components/returns/return-form";
import { ReturnHistory } from "@/components/returns/return-history";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ReturnsPage() {
  const { t } = useTranslations();
  const [returnHistoryKey, setReturnHistoryKey] = useState(0);

  const handleReturnSuccess = () => {
    setReturnHistoryKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("returns")}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("returnsDescription")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ReturnForm onSuccess={handleReturnSuccess} />
        <ReturnHistory key={returnHistoryKey} />
      </div>
    </div>
  );
}
