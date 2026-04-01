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
import { useTranslations } from "@/lib/i18n/use-translations";

interface ReturnRecord {
  id: number;
  product_name: string;
  quantity: number;
  return_amount: number;
  date_returned: string;
}

export function ReturnHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t, language } = useTranslations();

  const { data, isLoading } = useQuery({
    queryKey: ["returns", currentPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/returns?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const { records = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("returnHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead className="text-right">{t("quantity")}</TableHead>
                <TableHead className="text-right">
                  {t("returnAmount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record: ReturnRecord) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.date_returned), "PPP", {
                      locale: language === "es" ? es : undefined,
                    })}
                  </TableCell>
                  <TableCell>{record.product_name}</TableCell>
                  <TableCell className="text-right">
                    {record.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.return_amount)}
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("noReturns")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
