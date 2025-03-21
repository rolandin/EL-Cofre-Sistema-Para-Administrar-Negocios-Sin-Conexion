"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Product {
  id: number;
  name: string;
  sku: string;
  outboundPrice: number;
}

interface ReturnFormProps {
  onSuccess?: () => void;
}

export function ReturnForm({ onSuccess }: ReturnFormProps) {
  const queryClient = useQueryClient();
  const { t, language } = useTranslations();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [actualReturnAmount, setActualReturnAmount] = useState<string>("");

  // Fetch sold products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["soldProducts"],
    queryFn: async () => {
      const response = await fetch("/api/sales/products");
      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
  });

  // Find selected product details
  const selectedProductDetails = selectedProduct
    ? products.find((p: Product) => p.id.toString() === selectedProduct)
    : null;

  // Calculate maximum return amount based on quantity
  const maxReturnAmount = selectedProductDetails
    ? selectedProductDetails.outboundPrice * quantity
    : 0;

  const returnMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      quantity: number;
      returnAmount: number;
    }) => {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(t("error"));
      return response.json();
    },
    onSuccess: () => {
      toast.success(t("returnProcessed"));
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      setSelectedProduct("");
      setQuantity(1);
      setActualReturnAmount("");
      onSuccess?.();
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  const handleSubmit = () => {
    if (!selectedProduct || quantity < 1 || !actualReturnAmount) return;

    const returnAmount = parseFloat(actualReturnAmount);
    if (returnAmount > maxReturnAmount) {
      toast.error(t("maxReturnAmount"));
      return;
    }

    returnMutation.mutate({
      productId: selectedProduct,
      quantity,
      returnAmount: returnAmount / quantity, // Store per-unit return amount
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
    <Card>
      <CardHeader>
        <CardTitle>{t("processReturn")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("name")}</label>
          <Select
            value={selectedProduct}
            onValueChange={(value) => {
              setSelectedProduct(value);
              const product = products.find(
                (p: Product) => p.id.toString() === value
              );
              if (product) {
                setActualReturnAmount(
                  (product.outboundPrice * quantity).toString()
                );
              }
            }}
          >
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
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              setQuantity(newQuantity);
              if (selectedProductDetails) {
                setActualReturnAmount(
                  (
                    selectedProductDetails.outboundPrice * newQuantity
                  ).toString()
                );
              }
            }}
          />
        </div>

        {selectedProductDetails && (
          <>
            <div className="text-sm font-medium text-pink-500">
              {t("originalPrice")}:{" "}
              {formatCurrency(selectedProductDetails.outboundPrice * quantity)}
              {quantity > 1 &&
                ` (${formatCurrency(selectedProductDetails.outboundPrice)} ${t(
                  "perUnit"
                )})`}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("returnAmount")}</label>
              <Input
                type="number"
                min="0"
                max={maxReturnAmount}
                step="0.01"
                value={actualReturnAmount}
                onChange={(e) => setActualReturnAmount(e.target.value)}
              />
              {parseFloat(actualReturnAmount) > maxReturnAmount && (
                <p className="text-sm text-red-500">
                  {t("maxReturnAmount")} ({formatCurrency(maxReturnAmount)})
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={
            returnMutation.isPending ||
            !selectedProduct ||
            quantity < 1 ||
            !actualReturnAmount ||
            parseFloat(actualReturnAmount) > maxReturnAmount
          }
        >
          {returnMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("processing")}
            </>
          ) : (
            t("processReturnBtn")
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
