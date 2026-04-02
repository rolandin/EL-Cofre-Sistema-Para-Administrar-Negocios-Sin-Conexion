"use client";

import { useState } from "react";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";
import { formatCurrency } from "@/lib/utils/format-currency";

interface Product {
  id: number;
  name: string;
  sku: string;
  inboundPrice: number;
  quantity: number;
}

interface ReceiveFormProps {
  onSuccess?: () => void;
}

export function ReceiveForm({ onSuccess }: ReceiveFormProps) {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Find selected product details
  const selectedProductDetails = selectedProduct
    ? products.find((p: Product) => p.id.toString() === selectedProduct)
    : null;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: {
      productId: string;
      quantity: number;
      pricePerUnit: number;
    }) => {
      const response = await fetch("/api/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    onSuccess: () => {
      toast.success(t("receivedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["receiveHistory"] });
      setSelectedProduct("");
      setQuantity(1);
      onSuccess?.();
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error(t("noProductSelected"));
      return;
    }

    if (quantity < 1) {
      toast.error(t("invalidQuantity"));
      return;
    }

    const product = products.find(
      (p: Product) => p.id.toString() === selectedProduct
    );
    if (!product) return;

    mutate({
      productId: selectedProduct,
      quantity,
      pricePerUnit: product.inboundPrice,
    });
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
    <Card>
      <CardHeader>
        <CardTitle>{t("receiveInventory")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("name")}</label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectProduct")} />
            </SelectTrigger>
            <SelectContent>
              {products.map((product: Product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name} (SKU: {product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("quantity")}</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          />
        </div>

        {selectedProductDetails && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("pricePerUnit")}</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("priceInfo")}</p>
                    <p>{t("priceUpdateNote")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(selectedProductDetails.inboundPrice)}
            </p>
          </div>
        )}

        {selectedProductDetails && (
          <div className="text-right text-lg font-semibold">
            {t("total")}:{" "}
            {formatCurrency(quantity * selectedProductDetails.inboundPrice)}
          </div>
        )}
      </CardContent>
      <CardContent>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isPending || !selectedProduct || quantity < 1}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("receiving")}
            </>
          ) : (
            t("receiveInventoryBtn")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
