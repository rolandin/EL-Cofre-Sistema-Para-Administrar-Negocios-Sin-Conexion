"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiveForm } from "@/components/inventory/receive-form";
import { ReceiveHistory } from "@/components/inventory/receive-history";
import { NewProductForm } from "@/components/inventory/new-product-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ReceivePage() {
  const { t } = useTranslations();
  const [receiveHistoryKey, setReceiveHistoryKey] = useState(0);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const handleReceiveSuccess = () => {
    setReceiveHistoryKey((prev) => prev + 1);
  };

  const handleNewProductSuccess = () => {
    handleReceiveSuccess();
    setIsNewProductOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("receive")}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("receiveDescription")}
          </p>
        </div>
        <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
          <Button onClick={() => setIsNewProductOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("newProduct")}
          </Button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("newProduct")}</DialogTitle>
            </DialogHeader>
            <NewProductForm
              onSuccess={handleNewProductSuccess}
              onClose={() => setIsNewProductOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ReceiveForm onSuccess={handleReceiveSuccess} />
        <ReceiveHistory key={receiveHistoryKey} />
      </div>
    </div>
  );
}
