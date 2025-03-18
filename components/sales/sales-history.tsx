"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Sale {
  id: number;
  date_sold: string;
  item_name: string;
  type: "Product" | "Service";
  quantity: number;
  total_value: number;
  net_profit: number;
}

export function SalesHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { isAdmin } = useAuth();
  const { t, language } = useTranslations();

  const { data, isLoading } = useQuery({
    queryKey: ["sales", currentPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/sales?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const { sales = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t("salesHistory")}</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("item")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead className="text-right">{t("quantity")}</TableHead>
              <TableHead className="text-right">{t("totalValue")}</TableHead>
              {isAdmin && (
                <TableHead className="text-right">{t("netProfit")}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale: Sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.date_sold), "PPP", {
                    locale: language === "es" ? es : undefined,
                  })}
                </TableCell>
                <TableCell>{sale.item_name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sale.type === "Service"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    }`}
                  >
                    {t(sale.type.toLowerCase())}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {sale.type === "Product" ? sale.quantity : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat(
                    language === "es" ? "es-ES" : "en-US",
                    {
                      style: "currency",
                      currency: "USD",
                    }
                  ).format(sale.total_value)}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    {new Intl.NumberFormat(
                      language === "es" ? "es-ES" : "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    ).format(sale.net_profit)}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center py-8 text-gray-500"
                >
                  {t("noSales")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
