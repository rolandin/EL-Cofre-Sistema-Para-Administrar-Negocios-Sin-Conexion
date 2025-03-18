"use client";

import { useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Service {
  id: number;
  name: string;
  description: string;
  base_price: number;
  commission_percentage: number;
}

interface ServicesTableProps {
  onSelectService: (id: number) => void;
  selectedService: number | null;
}

export function ServicesTable({
  onSelectService,
  selectedService,
}: ServicesTableProps) {
  const { isAdmin } = useAuth();
  const { t, language } = useTranslations();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("availableServices")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead className="text-right">{t("basePrice")}</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">
                    {t("commission")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service: Service) => (
                <TableRow
                  key={service.id}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedService === service.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                  onClick={() => onSelectService(service.id)}
                >
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(service.base_price)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {service.commission_percentage}%
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 4 : 3}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("noServices")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
