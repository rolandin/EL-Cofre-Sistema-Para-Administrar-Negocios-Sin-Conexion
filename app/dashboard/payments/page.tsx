"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentHistory } from "@/components/payments/payment-history";
import { EmployeePaymentForm } from "@/components/payments/employee-payment-form";
import { ContractorPaymentForm } from "@/components/payments/contractor-payment-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function PaymentsPage() {
  const [historyKey, setHistoryKey] = useState(0);
  const { t } = useTranslations();

  const handlePaymentSuccess = () => {
    setHistoryKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("payments")}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("processPayments")}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("newPayment")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("processPayment")}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="employee">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">
                  {t("employeePayments")}
                </TabsTrigger>
                <TabsTrigger value="contractor">
                  {t("contractorPayments")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="employee">
                <EmployeePaymentForm onSuccess={handlePaymentSuccess} />
              </TabsContent>
              <TabsContent value="contractor">
                <ContractorPaymentForm onSuccess={handlePaymentSuccess} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <PaymentHistory key={historyKey} />
    </div>
  );
}
