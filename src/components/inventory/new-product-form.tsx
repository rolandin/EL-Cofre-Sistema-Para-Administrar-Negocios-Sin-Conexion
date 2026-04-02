"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface NewProductFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialFormState = {
  name: "",
  inboundPrice: "",
  outboundPrice: "",
  supplier: "",
  commissionPercentage: "0",
  quantity: "0",
};

export function NewProductForm({ onSuccess, onClose }: NewProductFormProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [formData, setFormData] = useState(initialFormState);

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          sku: `SKU-${nanoid(10)}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["receiveHistory"] });
      setFormData(initialFormState);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.inboundPrice || !formData.outboundPrice) {
      toast.error(t("error"));
      return;
    }

    // Validate prices
    const inboundPrice = parseFloat(formData.inboundPrice);
    const outboundPrice = parseFloat(formData.outboundPrice);

    if (outboundPrice <= inboundPrice) {
      toast.error(t("priceValidation"));
      return;
    }

    createProduct.mutate({
      ...formData,
      inboundPrice,
      outboundPrice,
      commissionPercentage: parseFloat(formData.commissionPercentage),
      quantity: parseInt(formData.quantity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
          <label className="text-sm font-medium">{t("quantity")}</label>
          <Input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("inboundPrice")} <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.inboundPrice}
            onChange={(e) =>
              setFormData({ ...formData, inboundPrice: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("outboundPrice")} <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.outboundPrice}
            onChange={(e) =>
              setFormData({ ...formData, outboundPrice: e.target.value })
            }
          />
          {formData.inboundPrice &&
            formData.outboundPrice &&
            parseFloat(formData.outboundPrice) <=
              parseFloat(formData.inboundPrice) && (
              <p className="text-sm text-red-500 mt-1">
                {t("priceValidation")}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("supplier")}</label>
          <Input
            value={formData.supplier}
            onChange={(e) =>
              setFormData({ ...formData, supplier: e.target.value })
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
        disabled={createProduct.isPending}
      >
        {createProduct.isPending ? (
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
