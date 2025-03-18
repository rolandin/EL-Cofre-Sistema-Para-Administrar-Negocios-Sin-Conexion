"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeManagement } from "@/components/settings/employee-management";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function EmployeesPage() {
  const { t } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("employees")}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("employeesDescription")}
          </p>
        </div>
      </div>

      <EmployeeManagement />
    </div>
  );
}
