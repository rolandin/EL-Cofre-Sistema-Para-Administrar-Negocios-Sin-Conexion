"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface ServiceFormProps {
  onSuccess?: () => void;
}

export function ServiceForm({ onSuccess }: ServiceFormProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
  });

  const createService = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          basePrice: parseFloat(data.basePrice),
          commissionPercentage: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("serviceCreated"));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setFormData({
        name: "",
        description: "",
        basePrice: "",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.basePrice) {
      toast.error(t("error"));
      return;
    }

    createService.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("name")} <span className="text-red-500">*</span>
        </label>
        <Input
          required
          placeholder="Ej: Corte de cabello"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <p className="text-xs text-gray-500">Nombre del servicio tal como aparecerá en el catálogo y las ventas.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("description")}</label>
        <Textarea
          placeholder="Ej: Corte de cabello con lavado incluido"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
        <p className="text-xs text-gray-500">Descripción opcional del servicio para más detalle.</p>
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("basePrice")} <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.basePrice}
            onChange={(e) =>
              setFormData({ ...formData, basePrice: e.target.value })
            }
          />
          <p className="text-xs text-gray-500">Precio que se cobra al cliente por este servicio. La distribución de ganancias se calcula según la tarifa de ubicación del contratista.</p>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createService.isPending}
      >
        {createService.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("creating")}
          </>
        ) : (
          t("create")
        )}
      </Button>
    </form>
  );
}
