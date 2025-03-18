"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  Plus,
  Trash2,
  Eye,
  Edit2,
  Save,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Contractor {
  id: number;
  name: string;
  location_fee_percentage: number;
  accumulated_commission: number;
  start_date: string;
  isActive: boolean;
}

interface ContractorFormData {
  name: string;
  locationFeePercentage: string;
}

interface ContractorEarnings {
  service_earnings: number;
  product_commissions: number;
  total_services: number;
  total_products: number;
}

interface ServiceRecord {
  id: number;
  service_name: string;
  price_charged: number;
  contractor_earnings: number;
  business_earnings: number;
  date_performed: string;
  notes?: string;
}

export function ContractorManagement() {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLocationFee, setEditedLocationFee] = useState("");
  const [formData, setFormData] = useState<ContractorFormData>({
    name: "",
    locationFeePercentage: "0",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch contractors with React Query
  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const response = await fetch("/api/contractors");
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  // Fetch selected contractor's details
  const { data: selectedContractorDetails } = useQuery({
    queryKey: ["contractor", selectedContractor?.id],
    queryFn: async () => {
      if (!selectedContractor?.id) return null;
      const response = await fetch(`/api/contractors/${selectedContractor.id}`);
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    enabled: !!selectedContractor?.id,
  });

  // Fetch selected contractor's earnings
  const { data: earnings } = useQuery({
    queryKey: ["contractor-earnings", selectedContractor?.id],
    queryFn: async () => {
      if (!selectedContractor) return null;
      const response = await fetch(
        `/api/contractors/${selectedContractor.id}/earnings`
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    enabled: !!selectedContractor,
  });

  // Fetch service history
  const { data: serviceHistory } = useQuery({
    queryKey: ["contractor-services", selectedContractor?.id, currentPage],
    queryFn: async () => {
      if (!selectedContractor) return null;
      const response = await fetch(
        `/api/contractors/${selectedContractor.id}/services?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    enabled: !!selectedContractor,
  });

  // Update the selected contractor when details change
  useEffect(() => {
    if (selectedContractorDetails) {
      setSelectedContractor(selectedContractorDetails);
    }
  }, [selectedContractorDetails]);

  // Create contractor mutation
  const createContractor = useMutation({
    mutationFn: async (data: ContractorFormData) => {
      const response = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          locationFeePercentage: parseFloat(data.locationFeePercentage),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        locationFeePercentage: "0",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update contractor mutation
  const updateContractor = useMutation({
    mutationFn: async (data: { id: number; locationFeePercentage: number }) => {
      const response = await fetch(`/api/contractors/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationFeePercentage: data.locationFeePercentage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({
        queryKey: ["contractor", selectedContractor?.id],
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Toggle contractor status mutation
  const toggleStatus = useMutation({
    mutationFn: async ({
      contractorId,
      currentStatus,
    }: {
      contractorId: number;
      currentStatus: boolean;
    }) => {
      const response = await fetch(`/api/contractors/${contractorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({
        queryKey: ["contractor", selectedContractor?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete contractor mutation
  const deleteContractor = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contractors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      setSelectedContractor(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error(t("error"));
      return;
    }

    const locationFee = parseFloat(formData.locationFeePercentage);
    if (isNaN(locationFee) || locationFee < 0 || locationFee > 100) {
      toast.error(t("error"));
      return;
    }

    createContractor.mutate(formData);
  };

  const handleSaveLocationFee = () => {
    if (!selectedContractor) return;

    const locationFee = parseFloat(editedLocationFee);
    if (isNaN(locationFee) || locationFee < 0 || locationFee > 100) {
      toast.error(t("error"));
      return;
    }

    updateContractor.mutate({
      id: selectedContractor.id,
      locationFeePercentage: locationFee,
    });
  };

  const handleStartEditing = () => {
    if (selectedContractor) {
      setEditedLocationFee(
        selectedContractor.location_fee_percentage.toString()
      );
      setIsEditing(true);
    }
  };

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

  const { records = [], total = 0 } = serviceHistory || {
    records: [],
    total: 0,
  };
  const totalPages = Math.ceil(total / itemsPerPage);

  // Sort contractors: active first, then inactive
  const sortedContractors = [...contractors].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return a.name.localeCompare(b.name);
    }
    return a.isActive ? -1 : 1;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("contractors")}</CardTitle>
              <CardDescription>{t("manageContractors")}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("newContractor")}
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("newContractor")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("name")} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("locationFee")}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.locationFeePercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationFeePercentage: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createContractor.isPending}
                  >
                    {createContractor.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("creating")}
                      </>
                    ) : (
                      t("create")
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead className="text-right">
                    {t("locationFee")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("accumulatedEarnings")}
                  </TableHead>
                  <TableHead>{t("startDate")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContractors.map((contractor: Contractor) => (
                  <TableRow
                    key={contractor.id}
                    className={
                      !contractor.isActive
                        ? "bg-gray-100 dark:bg-gray-800/50"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {contractor.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {contractor.location_fee_percentage}%
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(contractor.accumulated_commission)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contractor.start_date), "PPP", {
                        locale: language === "es" ? es : undefined,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedContractor(contractor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleStatus.mutate({
                              contractorId: contractor.id,
                              currentStatus: contractor.isActive,
                            })
                          }
                          disabled={toggleStatus.isPending}
                        >
                          {toggleStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : contractor.isActive ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("deleteContractor")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("deleteContractorConfirm")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteContractor.mutate(contractor.id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {contractors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      {t("noContractors")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedContractor}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContractor(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("contractorDetails")}</DialogTitle>
          </DialogHeader>
          {selectedContractor && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedContractor.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("started")}{" "}
                  {format(new Date(selectedContractor.start_date), "PPP", {
                    locale: language === "es" ? es : undefined,
                  })}
                </p>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
                  <TabsTrigger value="history">
                    {t("serviceHistory")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {t("locationFee")}
                            </CardTitle>
                            {!isEditing ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleStartEditing}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSaveLocationFee}
                                disabled={updateContractor.isPending}
                              >
                                {updateContractor.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={editedLocationFee}
                              onChange={(e) =>
                                setEditedLocationFee(e.target.value)
                              }
                              className="w-32"
                            />
                          ) : (
                            <p className="text-2xl font-bold">
                              {selectedContractor.location_fee_percentage}%
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {t("currentEarnings")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              selectedContractor.accumulated_commission
                            )}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {earnings && (
                      <Card className="space-y-4">
                        <CardHeader className="pb-2">
                          {t("allTimeEarnings")}
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                {t("servicesPerformed")}
                              </h4>
                              <p className="text-lg font-semibold">
                                {earnings.total_services}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                {t("productsSold")}
                              </h4>
                              <p className="text-lg font-semibold">
                                {earnings.total_products}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">
                                {t("serviceEarnings")}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(earnings.service_earnings)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">
                                {t("productCommissions")}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(earnings.product_commissions)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-medium">{t("total")}</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(
                                  earnings.service_earnings +
                                    earnings.product_commissions
                                )}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("date")}</TableHead>
                            <TableHead>{t("service")}</TableHead>
                            <TableHead className="text-right">
                              {t("price")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("earnings")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("business")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {records.map((record: ServiceRecord) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                {format(
                                  new Date(record.date_performed),
                                  "PPP",
                                  {
                                    locale: language === "es" ? es : undefined,
                                  }
                                )}
                              </TableCell>
                              <TableCell>{record.service_name}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(record.price_charged)}
                              </TableCell>
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
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
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
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1)
                                )
                              }
                              disabled={currentPage === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
