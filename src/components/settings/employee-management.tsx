"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  Plus,
  Eye,
  Edit2,
  Save,
  Trash2,
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
  DialogTrigger,
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
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number | null;
  hire_date: string;
  contractor_name: string | null;
  is_active: boolean;
}

interface EmployeeFormData {
  name: string;
  position: string;
  salary: string;
}

export function EmployeeManagement() {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [isNewEmployeeDialogOpen, setIsNewEmployeeDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    position: "",
    salary: "",
  });

  // Fetch employees with optimized caching
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    staleTime: 30000, // Data remains fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
  console.log({ employees });
  // Create employee mutation
  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          position: data.position,
          salary: data.salary ? parseFloat(data.salary) : null,
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
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsNewEmployeeDialogOpen(false);
      setFormData({
        name: "",
        position: "",
        salary: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update employee mutation
  const updateEmployee = useMutation({
    mutationFn: async (data: { id: number } & EmployeeFormData) => {
      const response = await fetch(`/api/employees/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          position: data.position,
          salary: data.salary ? parseFloat(data.salary) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSelectedEmployee(data);
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Toggle employee status mutation
  const toggleStatus = useMutation({
    mutationFn: async ({
      employeeId,
      currentStatus,
    }: {
      employeeId: number;
      currentStatus: boolean;
    }) => {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.details === "pendingPayments") {
          throw new Error(t("cannotDeactivateWithPendingPayments"));
        }
        if (error.details === "upcomingAppointments") {
          throw new Error(t("cannotDeactivateWithUpcomingAppointments"));
        }
        throw new Error(error.error || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.position) {
      toast.error(t("error"));
      return;
    }

    if (formData.salary && parseFloat(formData.salary) < 0) {
      toast.error(t("error"));
      return;
    }

    createEmployee.mutate(formData);
  };

  const handleStartEditing = () => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.name,
        position: selectedEmployee.position,
        salary: selectedEmployee.salary?.toString() || "",
      });
      setIsEditing(true);
    }
  };

  const handleUpdate = () => {
    if (!selectedEmployee) return;

    if (!formData.name || !formData.position) {
      toast.error(t("error"));
      return;
    }

    if (formData.salary && parseFloat(formData.salary) < 0) {
      toast.error(t("error"));
      return;
    }

    updateEmployee.mutate({
      id: selectedEmployee.id,
      ...formData,
    });
  };

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("employees")}</CardTitle>
              <CardDescription>{t("manageEmployees")}</CardDescription>
            </div>
            <Dialog
              open={isNewEmployeeDialogOpen}
              onOpenChange={setIsNewEmployeeDialogOpen}
            >
              <Button onClick={() => setIsNewEmployeeDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("newEmployee")}
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("newEmployee")}</DialogTitle>
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
                      {t("position")} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("salary")}</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createEmployee.isPending}
                  >
                    {createEmployee.isPending ? (
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
                  <TableHead>{t("position")}</TableHead>
                  <TableHead>{t("contractor")}</TableHead>
                  <TableHead className="text-right">{t("salary")}</TableHead>
                  <TableHead>{t("hireDate")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee: Employee) => (
                  <TableRow
                    key={employee.id}
                    className={
                      !employee.is_active
                        ? "bg-gray-100 dark:bg-gray-800/50 text-gray-400"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.contractor_name || t("na")}</TableCell>
                    <TableCell className="text-right">
                      {employee.salary
                        ? formatCurrency(employee.salary)
                        : t("na")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(employee.hire_date), "PPP", {
                        locale: language === "es" ? es : undefined,
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.is_active ? t("active") : t("inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleStatus.mutate({
                              employeeId: employee.id,
                              currentStatus: employee.is_active,
                            })
                          }
                          disabled={toggleStatus.isPending}
                        >
                          {toggleStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : employee.is_active ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      {t("noEmployees")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Employee Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEmployee(null);
            setIsEditing(false);
            setIsViewDialogOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{t("employeeDetails")}</DialogTitle>
              {selectedEmployee && !isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleStartEditing();
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("name")}</label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("position")}
                    </label>
                    <Input
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("salary")}</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: selectedEmployee.name,
                          position: selectedEmployee.position,
                          salary: selectedEmployee.salary?.toString() || "",
                        });
                      }}
                    >
                      {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={updateEmployee.isPending}>
                      {updateEmployee.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        t("saveChanges")
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedEmployee.position}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        {t("hireDate")}
                      </h4>
                      <p className="text-lg">
                        {format(new Date(selectedEmployee.hire_date), "PPP", {
                          locale: language === "es" ? es : undefined,
                        })}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        {t("salary")}
                      </h4>
                      <p className="text-lg">
                        {selectedEmployee.salary
                          ? formatCurrency(selectedEmployee.salary)
                          : t("na")}
                      </p>
                    </div>
                  </div>

                  {selectedEmployee.contractor_name && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        {t("associatedContractor")}
                      </h4>
                      <p className="text-lg">
                        {selectedEmployee.contractor_name}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      {t("status")}
                    </h4>
                    <p className="text-lg">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedEmployee.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedEmployee.is_active
                          ? t("active")
                          : t("inactive")}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
