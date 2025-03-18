"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Plus, Eye, Edit2, Save, Trash2 } from "lucide-react";
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
}

interface EmployeeFormData {
  name: string;
  position: string;
  salary: string;
}

export function EmployeeManagement() {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    cacheTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });

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
      setIsDialogOpen(false);
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

  // Delete employee mutation
  const deleteEmployee = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
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
      setSelectedEmployee(null);
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("employees")}</CardTitle>
              <CardDescription>{t("manageEmployees")}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={() => setIsDialogOpen(true)}>
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
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee: Employee) => (
                  <TableRow key={employee.id}>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <Eye className="h-4 w-4" />
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
                                {t("deleteEmployee")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("deleteEmployeeConfirm")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteEmployee.mutate(employee.id)
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
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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

      <Dialog
        open={!!selectedEmployee}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEmployee(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("employeeDetails")}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
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
                      onClick={() => setIsEditing(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={updateEmployee.isPending}
                    >
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
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedEmployee.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedEmployee.position}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStartEditing}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
