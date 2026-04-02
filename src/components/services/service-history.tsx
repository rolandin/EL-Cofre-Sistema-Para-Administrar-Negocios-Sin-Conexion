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
import { formatCurrency } from "@/lib/utils/format-currency";

interface ServiceRecord {
  id: number;
  contractor_name: string;
  client_name: string;
  price_charged: number;
  business_earnings: number;
  contractor_earnings: number;
  date_performed: string;
}

interface ServiceHistoryProps {
  serviceId: number | null;
}

export function ServiceHistory({ serviceId }: ServiceHistoryProps) {
  const { t, language } = useTranslations();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["serviceHistory", serviceId, currentPage],
    queryFn: async () => {
      if (!serviceId) return { records: [], total: 0 };
      const response = await fetch(
        `/api/services/${serviceId}/history?page=${currentPage}&limit=${pageSize}`
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    enabled: !!serviceId,
  });

  if (!serviceId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px] text-gray-500">
          {t("selectService")}
        </CardContent>
      </Card>
    );
  }

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
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("serviceHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("client")}</TableHead>
                <TableHead>{t("contractor")}</TableHead>
                <TableHead className="text-right">{t("earnings")}</TableHead>
                <TableHead className="text-right">{t("business")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record: ServiceRecord) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.date_performed), "PPP", {
                      locale: language === "es" ? es : undefined,
                    })}
                  </TableCell>
                  <TableCell>{record.client_name || t("na")}</TableCell>
                  <TableCell>{record.contractor_name || t("na")}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.contractor_earnings)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.business_earnings)}
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("noServiceHistory")}
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
