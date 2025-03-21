"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number | null;
}

interface EmployeePaymentFormProps {
  onSuccess?: () => void;
}

export function EmployeePaymentForm({ onSuccess }: EmployeePaymentFormProps) {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [formData, setFormData] = useState({
    employeeId: "",
    amount: "",
    periodStart: new Date(),
    periodEnd: new Date(),
  });

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  // Process payment mutation
  const processPayment = useMutation({
    mutationFn: async (data: {
      employeeId: number;
      amount: number;
      periodStart: string;
      periodEnd: string;
    }) => {
      const response = await fetch("/api/payments/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("paymentProcessed"));
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setFormData({
        employeeId: "",
        amount: "",
        periodStart: new Date(),
        periodEnd: new Date(),
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.amount) {
      toast.error(t("error"));
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("error"));
      return;
    }

    processPayment.mutate({
      employeeId: parseInt(formData.employeeId),
      amount,
      periodStart: format(formData.periodStart, "yyyy-MM-dd"),
      periodEnd: format(formData.periodEnd, "yyyy-MM-dd"),
    });
  };

  const employeeItems = employees.map((employee: Employee) => ({
    value: employee.id.toString(),
    label: `${employee.name} (${employee.position})${
      employee.salary ? ` - ${formatCurrency(employee.salary)}` : ""
    }`,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("name")}</label>
        <Combobox
          items={employeeItems}
          value={formData.employeeId}
          onChange={(value) => setFormData({ ...formData, employeeId: value })}
          placeholder={t("selectEmployee")}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("paymentAmount")}</label>
        <Input
          type="number"
          min="0"
          step="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("periodStart")}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {format(formData.periodStart, "PPP", {
                  locale: language === "es" ? es : undefined,
                })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.periodStart}
                onSelect={(date) =>
                  setFormData({ ...formData, periodStart: date || new Date() })
                }
                initialFocus
                locale={language === "es" ? es : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("periodEnd")}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {format(formData.periodEnd, "PPP", {
                  locale: language === "es" ? es : undefined,
                })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.periodEnd}
                onSelect={(date) =>
                  setFormData({ ...formData, periodEnd: date || new Date() })
                }
                initialFocus
                locale={language === "es" ? es : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={processPayment.isPending}
      >
        {processPayment.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : (
          t("processPayment")
        )}
      </Button>
    </form>
  );
}
