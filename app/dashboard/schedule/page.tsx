"use client";

import { useState, useMemo } from "react";
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

interface Appointment {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  notes: string;
  created_by_username: string;
}

// Generate time slots for the day (24 hours)
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

export default function SchedulePage() {
  const { t, language } = useTranslations();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "09:00",
    duration: "60",
    notes: "",
  });

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Fetch appointments for the selected date
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const start = format(selectedDate, "yyyy-MM-dd'T'00:00:00");
      const end = format(selectedDate, "yyyy-MM-dd'T'23:59:59");

      const response = await fetch(
        `/api/appointments?start=${start}&end=${end}`
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: {
      title: string;
      startTime: string;
      endTime: string;
      notes: string;
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
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update appointment mutation
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

  // Delete appointment mutation
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
    });
  };

  // Calculate appointment positions and heights
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
          <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
            {t("newAppointment")}
          </Button>
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
            <ScrollArea className="h-[600px]">
              <div className="relative">
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

                {/* Grid lines */}
                <div className="ml-16">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className="h-[30px] border-b border-gray-100 dark:border-gray-700"
                    />
                  ))}

                  {/* Appointments */}
                  <div className="absolute inset-0 ml-16">
                    {appointments.map((appointment: Appointment) => {
                      const style = getAppointmentStyle(appointment);
                      return (
                        <div
                          key={appointment.id}
                          className="absolute left-0 right-0 bg-blue-100 dark:bg-blue-900/50 rounded p-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/70"
                          style={style}
                          onClick={() => handleSelectAppointment(appointment)}
                        >
                          <div className="text-sm font-medium truncate">
                            {appointment.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {format(parseISO(appointment.start_time), "HH:mm")}{" "}
                            - {format(parseISO(appointment.end_time), "HH:mm")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
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
            });
          }
        }}
      >
        <DialogContent>
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
