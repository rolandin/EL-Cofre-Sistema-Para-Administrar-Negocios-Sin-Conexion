"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import enUS from "date-fns/locale/en-US";
import es from "date-fns/locale/es";
import ar from "date-fns/locale/ar";
import hi from "date-fns/locale/hi";
import bn from "date-fns/locale/bn";
import zhCN from "date-fns/locale/zh-CN";
import fa from "date-fns/locale/fa-IR";
import type { Locale } from "date-fns";
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

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  inboundPrice: number;
  outboundPrice: number;
  lastUpdated: string;
}

interface InventoryTableProps {
  search: string;
  sortBy: string;
  onSelectProduct: (id: number) => void;
  selectedProduct: number | null;
  userRole?: string;
}

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

const dateLocales: { [key: string]: Locale } = {
  en: enUS, // English
  es, // Spanish
  ar, // Arabic
  hi, // Hindi
  bn, // Bengali
  zh: zhCN, // Chinese (Simplified)
  fa, // Persian/Farsi
  // Fallback to English for unsupported languages
  ur: enUS, // Urdu
  sw: enUS, // Swahili
  ha: enUS, // Hausa
  pa: enUS, // Punjabi
  yo: enUS, // Yoruba
  ig: enUS, // Igbo
  am: enUS, // Amharic
  so: enUS, // Somali
  ku: enUS, // Kurdish
  xh: enUS, // Xhosa
  si: enUS, // Sinhala
  ne: enUS, // Nepali
  fil: enUS, // Filipino/Tagalog
};

export function InventoryTable({
  search,
  sortBy,
  onSelectProduct,
  selectedProduct,
  userRole,
}: InventoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t, language } = useTranslations();

  const { data, isLoading } = useQuery({
    queryKey: ["products", currentPage, search, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search,
        sortBy,
      });

      const response = await fetch(`/api/inventory?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const canViewDetails = userRole === "admin" || userRole === "superadmin";

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const { products = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("currentInventory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead className="text-right">{t("quantity")}</TableHead>
                <TableHead className="text-right">{t("value")}</TableHead>
                <TableHead>{t("lastUpdated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => (
                <TableRow
                  key={product.id}
                  className={`${
                    canViewDetails
                      ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      : ""
                  } ${
                    selectedProduct === product.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                  onClick={() => canViewDetails && onSelectProduct(product.id)}
                >
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.outboundPrice)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(product.lastUpdated), "PPP", {
                      locale: dateLocales[language] || enUS,
                    })}
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("noProducts")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
      </CardContent>
    </Card>
  );
}
