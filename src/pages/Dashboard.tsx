import { useQuery } from "@tanstack/react-query";
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

interface MetricCardProps {
  title: string;
  value: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  valueClassName?: string;
}

function MetricCard({ title, value, accent, gradientFrom, gradientTo, valueClassName }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[hsl(220,14%,14%)] p-5">
      {/* Gradient accent bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />

      {/* Subtle gradient glow */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${accent} opacity-[0.07] blur-2xl`} />

      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName || "text-gray-900 dark:text-white"}`}>
        {value}
      </p>
    </div>
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
  } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await fetch("/api/metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
    enabled: isAdmin,
  });

  const fmt = (value: number) =>
    `$${new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t("welcome")}</p>
      </div>

      {isAdmin && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title={t("inventoryValue")}
            value={fmt(metrics.inventoryValue)}
            accent="bg-sky-500"
            gradientFrom="from-sky-400"
            gradientTo="to-sky-600"
          />
          <MetricCard
            title={t("potentialValue")}
            value={fmt(metrics.potentialValue)}
            accent="bg-indigo-500"
            gradientFrom="from-indigo-400"
            gradientTo="to-indigo-600"
          />
          <MetricCard
            title={t("totalSales")}
            value={fmt(metrics.totalSales)}
            accent="bg-violet-500"
            gradientFrom="from-violet-400"
            gradientTo="to-violet-600"
          />
          <MetricCard
            title={t("netProfit")}
            value={fmt(metrics.netProfit)}
            accent="bg-emerald-500"
            gradientFrom="from-emerald-400"
            gradientTo="to-emerald-600"
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
          <MetricCard
            title={t("totalReturns")}
            value={fmt(metrics.totalReturns)}
            accent="bg-rose-500"
            gradientFrom="from-rose-400"
            gradientTo="to-rose-600"
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
