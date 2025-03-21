"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/lib/i18n/use-translations";
import { formatCurrency } from "@/lib/utils/format-currency";

interface EmployeePayment {
  id: number;
  employee_name: string;
  payment_amount: number;
  payment_date: string;
  payment_period_start: string;
  payment_period_end: string;
}

interface ContractorPayment {
  id: number;
  contractor_name: string;
  contractor_earnings: number;
  business_earnings: number;
  payment_date: string;
  service_name: string;
}

export function PaymentHistory() {
  const [employeePayments, setEmployeePayments] = useState<EmployeePayment[]>(
    []
  );
  const [contractorPayments, setContractorPayments] = useState<
    ContractorPayment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("employee");
  const itemsPerPage = 10;
  const { t, language } = useTranslations();

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const endpoint =
          activeTab === "employee"
            ? "/api/payments/employee"
            : "/api/payments/contractor";

        const response = await fetch(
          `${endpoint}?page=${currentPage}&limit=${itemsPerPage}`
        );
        const data = await response.json();

        if (activeTab === "employee") {
          setEmployeePayments(data.payments);
        } else {
          setContractorPayments(data.payments);
        }
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [activeTab, currentPage]);

  if (loading) {
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
        <CardTitle>{t("paymentHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee">{t("employeePayments")}</TabsTrigger>
            <TabsTrigger value="contractor">
              {t("contractorPayments")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employee">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("paymentPeriod")}</TableHead>
                    <TableHead className="text-right">
                      {t("paymentAmount")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), "PPP", {
                          locale: language === "es" ? es : undefined,
                        })}
                      </TableCell>
                      <TableCell>{payment.employee_name}</TableCell>
                      <TableCell>
                        {format(new Date(payment.payment_period_start), "PPP", {
                          locale: language === "es" ? es : undefined,
                        })}{" "}
                        -{" "}
                        {format(new Date(payment.payment_period_end), "PPP", {
                          locale: language === "es" ? es : undefined,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.payment_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {employeePayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        {t("noPayments")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="contractor">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("service")}</TableHead>
                    <TableHead className="text-right">
                      {t("earnings")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("business")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractorPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), "PPP", {
                          locale: language === "es" ? es : undefined,
                        })}
                      </TableCell>
                      <TableCell>{payment.contractor_name}</TableCell>
                      <TableCell>{payment.service_name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.contractor_earnings)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.business_earnings)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {contractorPayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        {t("noPayments")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

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
