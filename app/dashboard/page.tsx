"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  RotateCcw,
  Package,
} from "lucide-react";
import { SaleForm } from "@/components/sales/sale-form";
import { SalesHistory } from "@/components/sales/sales-history";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Metrics {
  inventoryValue: number;
  potentialValue: number;
  totalSales: number;
  netProfit: number;
  totalReturns: number;
}

function MetricCard({
  title,
  value,
  icon,
  valueClassName = "",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-blue-50 p-2 dark:bg-blue-900/20">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <h3 className={`text-xl font-semibold ${valueClassName}`}>{value}</h3>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { t } = useTranslations();

  const {
    data: metrics = {
      inventoryValue: 0,
      potentialValue: 0,
      totalSales: 0,
      netProfit: 0,
      totalReturns: 0,
    },
    isLoading,
  } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await fetch("/api/metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
    enabled: isAdmin,
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t("welcome")}</p>
      </div>

      {isAdmin && (
        <div className="grid gap-4 grid-cols-5">
          <MetricCard
            title={t("inventoryValue")}
            value={formatCurrency(metrics.inventoryValue)}
            icon={<Package className="h-5 w-5 text-blue-600" />}
          />
          <MetricCard
            title={t("potentialValue")}
            value={formatCurrency(metrics.potentialValue)}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          />
          <MetricCard
            title={t("totalSales")}
            value={formatCurrency(metrics.totalSales)}
            icon={<ShoppingCart className="h-5 w-5 text-purple-600" />}
          />
          <MetricCard
            title={t("netProfit")}
            value={formatCurrency(metrics.netProfit)}
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
            valueClassName="text-green-500"
          />
          <MetricCard
            title={t("totalReturns")}
            value={formatCurrency(metrics.totalReturns)}
            icon={<RotateCcw className="h-5 w-5 text-pink-500" />}
            valueClassName="text-pink-500"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <SaleForm />
        <SalesHistory />
      </div>
    </div>
  );
}
