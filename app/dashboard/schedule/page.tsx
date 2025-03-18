"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  format,
  addMinutes,
  parseISO,
  setHours,
  setMinutes,
  addHours,
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";

// Define a set of distinct colors using Tailwind's color palette
// These are carefully selected for good contrast and visibility
const CONTRACTOR_COLORS = [
  "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900/70",
  "bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900/70",
  "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900/70",
  "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900/70",
  "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-900/70",
  "bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:hover:bg-cyan-900/70",
  "bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/50 dark:hover:bg-teal-900/70",
  "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900/70",
  "bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/50 dark:hover:bg-pink-900/70",
  "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/50 dark:hover:bg-orange-900/70",
] as const;

// Function to get color for a contractor
const getContractorColor = (contractorId: number) => {
  // Use modulo to cycle through colors if we have more contractors than colors
  const colorIndex = (contractorId - 1) % CONTRACTOR_COLORS.length;
  return CONTRACTOR_COLORS[colorIndex];
};

// Add a visual indicator if the color is being reused
const getContractorColorGroup = (contractorId: number) => {
  return Math.floor((contractorId - 1) / CONTRACTOR_COLORS.length) + 1;
};

interface Appointment {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  notes: string;
  created_by_username: string;
  contractor_id?: number;
  employee_id?: number;
  contractor_name?: string;
  employee_name?: string;
}

interface Contractor {
  id: number;
  name: string;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      label: `${hour}:00`,
    });
    slots.push({
      time: `${hour.toString().padStart(2, "0")}:30`,
      label: `${hour}:30`,
    });
  }
  return slots;
};

// Helper to group appointments by contractor
const groupAppointmentsByContractor = (
  appointments: Appointment[],
  contractors: Contractor[]
) => {
  const grouped = new Map<number, Appointment[]>();

  // Initialize empty arrays for all contractors
  contractors.forEach((contractor) => {
    grouped.set(contractor.id, []);
  });

  // Group appointments by contractor
  appointments.forEach((appointment) => {
    const contractorAppointments = grouped.get(appointment.contractor_id) || [];
    contractorAppointments.push(appointment);
  });

  return grouped;
};

// Modify your getAppointmentStyle function to be simpler
const getAppointmentStyle = (appointment: Appointment) => {
  const start = parseISO(appointment.start_time);
  const end = parseISO(appointment.end_time);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);

  return {
    top: `${startMinutes}px`,
    height: `${duration}px`,
  };
};

export default function SchedulePage() {
  const { t, language } = useTranslations();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    startTime: "09:00",
    duration: "60",
    notes: "",
    contractorId: "",
    employeeId: "",
    serviceId: "",
    clientName: "",
  });

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const { data: contractors = [] } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const response = await fetch("/api/contractors");
      if (!response.ok) throw new Error("Failed to fetch contractors");
      return response.json();
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const { data: contractorCount = 5 } = useQuery({
    queryKey: ["contractors-count"],
    queryFn: async () => {
      const response = await fetch("/api/contractors/count");
      if (!response.ok) throw new Error("Failed to fetch contractor count");
      return response.json();
    },
  });

  const { data: appointments = [] } = useQuery({
    queryKey: [
      "appointments",
      format(selectedDate, "yyyy-MM-dd"),
      selectedFilter,
    ],
    queryFn: async () => {
      const start = format(selectedDate, "yyyy-MM-dd'T'00:00:00");
      const end = format(selectedDate, "yyyy-MM-dd'T'23:59:59");
      let url = `/api/appointments?start=${start}&end=${end}`;

      if (selectedFilter !== "all") {
        const [type, id] = selectedFilter.split("-");
        url += `&${type}Id=${id}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (data: {
      title: string;
      startTime: string;
      endTime: string;
      notes: string;
      contractorId?: number;
      employeeId?: number;
      serviceId?: number;
      clientName?: string;
    }) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("appointmentCreated"));
      queryClient.invalidateQueries({
        queryKey: ["appointments", format(selectedDate, "yyyy-MM-dd")],
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        startTime: "09:00",
        duration: "60",
        notes: "",
        contractorId: "",
        employeeId: "",
        serviceId: "",
        clientName: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async (data: {
      id: number;
      title: string;
      startTime: string;
      endTime: string;
      notes: string;
    }) => {
      const response = await fetch(`/api/appointments/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("appointmentUpdated"));
      queryClient.invalidateQueries({
        queryKey: ["appointments", format(selectedDate, "yyyy-MM-dd")],
      });
      setSelectedAppointment(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("appointmentDeleted"));
      queryClient.invalidateQueries({
        queryKey: ["appointments", format(selectedDate, "yyyy-MM-dd")],
      });
      setSelectedAppointment(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCreateAppointment = () => {
    const startDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      ...formData.startTime.split(":").map(Number)
    );

    const endDateTime = addMinutes(startDateTime, parseInt(formData.duration));

    createAppointment.mutate({
      title: formData.title,
      startTime: format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
      notes: formData.notes,
      contractorId: formData.contractorId
        ? parseInt(formData.contractorId)
        : undefined,
      employeeId: formData.employeeId
        ? parseInt(formData.employeeId)
        : undefined,
      serviceId: formData.serviceId ? parseInt(formData.serviceId) : undefined,
      clientName: formData.clientName || undefined,
    });
  };

  const handleUpdateAppointment = () => {
    if (!selectedAppointment) return;

    const startDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      ...formData.startTime.split(":").map(Number)
    );

    const endDateTime = addMinutes(startDateTime, parseInt(formData.duration));

    updateAppointment.mutate({
      id: selectedAppointment.id,
      title: formData.title,
      startTime: format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
      notes: formData.notes,
    });
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const start = parseISO(appointment.start_time);
    const end = parseISO(appointment.end_time);
    const duration = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );

    setFormData({
      title: appointment.title,
      startTime: format(start, "HH:mm"),
      duration: duration.toString(),
      notes: appointment.notes,
      contractorId: appointment.contractor_id?.toString() || "",
      employeeId: appointment.employee_id?.toString() || "",
      serviceId: "",
      clientName: "",
    });
  };

  // Function to check if two appointments overlap in time
  const doAppointmentsOverlap = (a: Appointment, b: Appointment) => {
    const aStart = parseISO(a.start_time);
    const aEnd = parseISO(a.end_time);
    const bStart = parseISO(b.start_time);
    const bEnd = parseISO(b.end_time);

    return (
      (aStart < bEnd && aEnd > bStart) || // a overlaps with b
      (bStart < aEnd && bEnd > aStart) // b overlaps with a
    );
  };

  // Function to get the position index for an appointment
  const getAppointmentPosition = (
    appointment: Appointment,
    allAppointments: Appointment[]
  ) => {
    // Get all appointments that come before this one in the array
    const previousAppointments = allAppointments.slice(
      0,
      allAppointments.findIndex((a) => a.id === appointment.id)
    );

    // Find overlapping appointments that come before this one
    const overlappingAppointments = previousAppointments.filter((a) =>
      doAppointmentsOverlap(appointment, a)
    );

    // The position will be the number of overlapping appointments
    return overlappingAppointments.length;
  };

  const groupOverlappingAppointments = (appointments: Appointment[]) => {
    const groups: Appointment[][] = [];

    appointments.forEach((appointment) => {
      const start = parseISO(appointment.start_time);
      const end = parseISO(appointment.end_time);

      let foundGroup = false;
      for (const group of groups) {
        const overlaps = group.some((existing) => {
          const existingStart = parseISO(existing.start_time);
          const existingEnd = parseISO(existing.end_time);
          return (
            (start >= existingStart && start < existingEnd) ||
            (end > existingStart && end <= existingEnd) ||
            (start <= existingStart && end >= existingEnd)
          );
        });

        if (!overlaps) {
          group.push(appointment);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([appointment]);
      }
    });

    return groups;
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return minutes;
  };

  const scrollToCurrentTime = useCallback(() => {
    // Find the actual scrollable container within the ScrollArea
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      const currentPosition = getCurrentTimePosition();
      const containerHeight = scrollContainer.clientHeight;
      const scrollPosition = currentPosition - containerHeight / 2; // Center in viewport
      // Use scrollTo for smooth scrolling
      scrollContainer.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    // Initial scroll with a delay to ensure render is complete
    const initialScroll = setTimeout(() => {
      scrollToCurrentTime();
    }, 500);

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
      if (selectedDate.toDateString() === new Date().toDateString()) {
        scrollToCurrentTime();
      }
    }, 60000);

    return () => {
      clearTimeout(initialScroll);
      clearInterval(timeInterval);
    };
  }, [scrollToCurrentTime, selectedDate]);

  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("schedule")}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("scheduleDescription")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={language === "es" ? es : undefined}
            className="rounded-md border"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={scrollToCurrentTime}
            >
              {t("now")}
            </Button>
            <Button className="flex-1" onClick={() => setIsDialogOpen(true)}>
              {t("newAppointment")}
            </Button>
          </div>
        </div>

        <div className="border rounded-lg bg-white dark:bg-gray-800">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">
              {format(selectedDate, "PPP", {
                locale: language === "es" ? es : undefined,
              })}
            </h2>
          </div>

          <div className="relative">
            <ScrollArea className="h-[600px]" ref={scrollAreaRef}>
              <div className="relative min-h-[1440px]">
                {" "}
                {/* Force full day height */}
                {/* Time slots */}
                <div className="absolute left-0 top-0 w-16 border-r bg-gray-50 dark:bg-gray-900 z-10">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className="h-[30px] px-2 text-xs text-right text-gray-500"
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
                {/* Contractor columns */}
                <div className="ml-16 flex">
                  {contractors.map((contractor) => {
                    const colorClass = getContractorColor(contractor.id);
                    const contractorAppointments =
                      groupAppointmentsByContractor(
                        appointments,
                        contractors
                      ).get(contractor.id) || [];

                    return (
                      <div
                        key={contractor.id}
                        className="flex-1 relative border-r min-w-[200px]"
                      >
                        {/* Contractor name header - now using the same color scheme */}
                        <div
                          className={`sticky top-0 z-10 px-2 py-1 text-sm font-medium ${colorClass} border-b`}
                        >
                          {contractor.name}
                        </div>

                        {/* Time grid */}
                        {timeSlots.map((slot) => (
                          <div
                            key={slot.time}
                            className="h-[30px] border-b border-gray-100 dark:border-gray-700"
                          />
                        ))}

                        {/* Appointments */}
                        {contractorAppointments.map((appointment) => {
                          return (
                            <div
                              key={appointment.id}
                              className={`absolute left-0 right-0 mx-1 ${colorClass} rounded p-2 cursor-pointer`}
                              style={getAppointmentStyle(appointment)}
                              onClick={() =>
                                handleSelectAppointment(appointment)
                              }
                            >
                              <div className="text-sm font-medium truncate">
                                {appointment.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {format(
                                  parseISO(appointment.start_time),
                                  "HH:mm"
                                )}{" "}
                                -{" "}
                                {format(
                                  parseISO(appointment.end_time),
                                  "HH:mm"
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                {/* Current time indicator */}
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className="absolute left-[14px] w-[20px] h-[20px] -mt-[10px] rounded-full bg-red-500 border-2 border-white dark:border-gray-800" />
                    <div className="absolute left-16 right-0 border-t-2 border-red-500" />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <Dialog
        open={isDialogOpen || !!selectedAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedAppointment(null);
            setFormData({
              title: "",
              startTime: "09:00",
              duration: "60",
              notes: "",
              contractorId: "",
              employeeId: "",
              serviceId: "",
              clientName: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? t("editAppointment") : t("newAppointment")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("title")} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("startTime")} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("duration")} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("service")}</label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectService")} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service: any) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("contractor")}</label>
              <Select
                value={formData.contractorId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    contractorId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectContractor")} />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor: any) => (
                    <SelectItem
                      key={contractor.id}
                      value={contractor.id.toString()}
                    >
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("notes")}</label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              {selectedAppointment && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      {t("deleteAppointment")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("deleteAppointmentConfirm")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("deleteAppointmentDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteAppointment.mutate(selectedAppointment.id)
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                onClick={
                  selectedAppointment
                    ? handleUpdateAppointment
                    : handleCreateAppointment
                }
                disabled={
                  !formData.title || !formData.startTime || !formData.duration
                }
              >
                {selectedAppointment
                  ? t("updateAppointment")
                  : t("createAppointment")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
