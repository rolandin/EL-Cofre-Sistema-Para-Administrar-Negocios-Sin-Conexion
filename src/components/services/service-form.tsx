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
    commissionPercentage: "0",
  });

  const createService = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          basePrice: parseFloat(data.basePrice),
          commissionPercentage: parseFloat(data.commissionPercentage),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("serviceCreated"));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      // Reset form
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        commissionPercentage: "0",
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
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("description")}</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("commission")}</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.commissionPercentage}
            onChange={(e) =>
              setFormData({ ...formData, commissionPercentage: e.target.value })
            }
          />
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
