"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

// Helper function to escape and format CSV fields
function formatCSVField(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Format numbers consistently
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  // Convert to string and escape special characters
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function SalesReport() {
  const { t, language } = useTranslations();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(),
  });

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales-report", dateRange.from, dateRange.to],
    queryFn: async () => {
      const response = await fetch(
        "/api/sales?" +
          new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            limit: "1000", // Get all records for the period
          })
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  const handleExport = () => {
    if (!salesData?.sales?.length) {
      toast.error(t("noDataToExport"));
      return;
    }

    try {
      // Prepare headers
      const headers = [
        t("date"),
        t("item"),
        t("type"),
        t("quantity"),
        t("totalValue"),
      ];
      const hasProfit = salesData.sales[0].net_profit !== undefined;
      if (hasProfit) {
        headers.push(t("netProfit"));
      }

      // Calculate totals while generating rows
      const totals = { total_value: 0, net_profit: 0 };
      const rows = salesData.sales.map((sale: any) => {
        totals.total_value += sale.total_value;
        if (hasProfit) {
          totals.net_profit += sale.net_profit;
        }

        const row = [
          format(new Date(sale.date_sold), "yyyy-MM-dd"),
          sale.item_name,
          t(sale.type.toLowerCase()),
          sale.quantity || "",
          sale.total_value,
        ];

        if (hasProfit) {
          row.push(sale.net_profit);
        }

        return row.map(formatCSVField).join(",");
      });

      // Create totals row
      const totalsRow = [t("total"), "", "", "", totals.total_value];
      if (hasProfit) {
        totalsRow.push(totals.net_profit);
      }

      // Combine all parts of the CSV with UTF-8 BOM
      const BOM = "\uFEFF"; // Add BOM for Excel compatibility
      const csvContent =
        BOM +
        [
          headers.join(","),
          ...rows,
          totalsRow.map(formatCSVField).join(","),
        ].join("\r\n"); // Use CRLF for better Excel compatibility

      // Create and download file
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `sales-report-${format(
        dateRange.from,
        "yyyy-MM-dd"
      )}-to-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(t("reportExported"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("error"));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("salesReport")}</CardTitle>
        <CardDescription>{t("generateReport")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("from")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from
                    ? format(dateRange.from, "PPP", {
                        locale: language === "es" ? es : undefined,
                      })
                    : t("pickDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    date && setDateRange({ ...dateRange, from: date })
                  }
                  initialFocus
                  locale={language === "es" ? es : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("to")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to
                    ? format(dateRange.to, "PPP", {
                        locale: language === "es" ? es : undefined,
                      })
                    : t("pickDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) =>
                    date && setDateRange({ ...dateRange, to: date })
                  }
                  initialFocus
                  locale={language === "es" ? es : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleExport}
              disabled={isLoading || !salesData?.sales?.length}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              {t("exportReport")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : salesData?.sales?.length ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("totalSales")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      salesData.sales.reduce(
                        (sum: number, sale: any) => sum + sale.total_value,
                        0
                      )
                    )}
                  </p>
                </CardContent>
              </Card>

              {salesData.sales[0].net_profit !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("totalProfit")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        salesData.sales.reduce(
                          (sum: number, sale: any) => sum + sale.net_profit,
                          0
                        )
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <p className="text-sm text-gray-500">
              {salesData.sales.length} {t("recordsFound")}
            </p>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">
            {t("noDataAvailable")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
