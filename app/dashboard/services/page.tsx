"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicesTable } from "@/components/services/services-table";
import { ServiceForm } from "@/components/services/service-form";
import { ServiceHistory } from "@/components/services/service-history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ServicesPage() {
  const { t } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const { isAdmin } = useAuth();

  const handleServiceSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("services")}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("servicesDescription")}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("newService")}
            </Button>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t("newService")}</DialogTitle>
              </DialogHeader>
              <ServiceForm onSuccess={handleServiceSuccess} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ServicesTable
          onSelectService={setSelectedService}
          selectedService={selectedService}
        />
        <ServiceHistory serviceId={selectedService} />
      </div>
    </div>
  );
}
