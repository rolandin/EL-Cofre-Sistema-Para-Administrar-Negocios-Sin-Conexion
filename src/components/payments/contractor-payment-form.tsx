"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Contractor {
  id: number;
  name: string;
  location_fee_percentage: number;
  isActive: boolean;
}

interface Sale {
  id: number;
  service_name: string;
  date_performed: string;
  price_charged: number;
  contractor_earnings: number;
}

interface ContractorPaymentFormProps {
  onSuccess?: () => void;
}

export function ContractorPaymentForm({
  onSuccess,
}: ContractorPaymentFormProps) {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [selectedContractor, setSelectedContractor] = useState("");

  // Fetch contractors
  const { data: contractors = [], isLoading: loadingContractors } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const response = await fetch("/api/contractors");
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  // Fetch unpaid sales for selected contractor
  const { data: unpaidSales = [], isLoading: loadingUnpaidSales } = useQuery({
    queryKey: ["unpaidSales", selectedContractor],
    queryFn: async () => {
      if (!selectedContractor) return [];
      const response = await fetch(
        `/api/contractors/${selectedContractor}/unpaid-sales`
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    enabled: !!selectedContractor,
  });

  // Process payment mutation
  const processPayment = useMutation({
    mutationFn: async (data: { contractorId: number; saleIds: number[] }) => {
      const response = await fetch("/api/payments/contractor", {
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
      queryClient.invalidateQueries({ queryKey: ["unpaidSales"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setSelectedContractor("");
      setSelectedSales([]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractor || selectedSales.length === 0) {
      toast.error(t("error"));
      return;
    }

    processPayment.mutate({
      contractorId: parseInt(selectedContractor),
      saleIds: selectedSales.map((id) => parseInt(id)),
    });
  };

  const handleSelectAll = () => {
    if (Array.isArray(unpaidSales)) {
      if (selectedSales.length === unpaidSales.length) {
        // If all are selected, unselect all
        setSelectedSales([]);
      } else {
        // Otherwise, select all
        setSelectedSales(unpaidSales.map((sale) => sale.id.toString()));
      }
    }
  };

  // Filter out inactive contractors
  const activeContractors = contractors.filter(
    (contractor: Contractor) => contractor.isActive
  );

  const contractorItems = activeContractors.map((contractor: Contractor) => ({
    value: contractor.id.toString(),
    label: contractor.name,
  }));

  const totalEarnings = Array.isArray(unpaidSales)
    ? unpaidSales
        .filter((sale) => selectedSales.includes(sale.id.toString()))
        .reduce((sum, sale) => sum + sale.contractor_earnings, 0)
    : 0;

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (loadingContractors) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!Array.isArray(contractors) || contractors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">{t("noContractors")}</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("name")}</label>
        <Combobox
          items={contractorItems}
          value={selectedContractor}
          onChange={(value) => {
            setSelectedContractor(value);
            setSelectedSales([]); // Reset selections when contractor changes
          }}
          placeholder={t("selectContractor")}
        />
      </div>

      {loadingUnpaidSales ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : selectedContractor &&
        Array.isArray(unpaidSales) &&
        unpaidSales.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("selectSales")}</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedSales.length === unpaidSales.length
                ? t("unselectAll")
                : t("selectAll")}
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
            {unpaidSales.map((sale) => (
              <div
                key={`${sale.id}-${sale.service_name}-${sale.date_performed}`}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id={`sale-${sale.id}`}
                  checked={selectedSales.includes(sale.id.toString())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSales([...selectedSales, sale.id.toString()]);
                    } else {
                      setSelectedSales(
                        selectedSales.filter((id) => id !== sale.id.toString())
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor={`sale-${sale.id}`} className="flex-1 text-sm">
                  {sale.service_name} - {formatCurrency(sale.price_charged)}
                  <span className="text-gray-500 ml-2">
                    ({t("earnings")}: {formatCurrency(sale.contractor_earnings)}
                    )
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : selectedContractor ? (
        <div className="text-center py-4 text-gray-500">
          {t("noUnpaidSales")}
        </div>
      ) : null}

      {selectedSales.length > 0 && (
        <div className="text-right text-lg font-semibold">
          {t("total")}: {formatCurrency(totalEarnings)}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          processPayment.isPending ||
          !selectedContractor ||
          selectedSales.length === 0
        }
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
