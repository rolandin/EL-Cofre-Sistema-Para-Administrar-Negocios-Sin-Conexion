"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const pageSize = 10;

  const deleteService = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(t("serviceDeleted"));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setServiceToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (e: React.MouseEvent, serviceId: number) => {
    e.stopPropagation(); // Prevent row click
    setServiceToDelete(serviceId);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["services", currentPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/services?page=${currentPage}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  const services = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

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
                  <>
                    <TableHead className="text-right">
                      {t("commission")}
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </>
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
                    <>
                      <TableCell className="text-right">
                        {service.commission_percentage}%
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, service.id)}
                          disabled={deleteService.isPending}
                        >
                          {deleteService.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 5 : 3}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("noServices")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!serviceToDelete}
        onOpenChange={() => setServiceToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteService")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteService")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServiceToDelete(null)}
              disabled={deleteService.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (serviceToDelete) {
                  deleteService.mutate(serviceToDelete);
                }
              }}
              disabled={deleteService.isPending}
            >
              {deleteService.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
