"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, X, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  inboundPrice: number;
  outboundPrice: number;
  supplier: string;
  commissionPercentage: number;
  lastUpdated: string;
}

interface ProductDetailsProps {
  productId: number | null;
  onClose: () => void;
}

export function ProductDetails({ productId, onClose }: ProductDetailsProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const { isAdmin } = useAuth();
  const { t, language } = useTranslations();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setIsEditing(false);
    }
  }, [product]);

  const updateProduct = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    if (!editedProduct) return;

    if (editedProduct.outboundPrice <= editedProduct.inboundPrice) {
      toast.error(t("priceValidation"));
      return;
    }

    updateProduct.mutate(editedProduct);
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!productId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px] text-gray-500">
          {t("selectProductToView")}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!product || !editedProduct) return null;

  const profit = product.outboundPrice - product.inboundPrice;
  const profitMargin = (profit / product.inboundPrice) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("productDetails")}</CardTitle>
        <div className="flex gap-2">
          {isAdmin && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          )}
          {isEditing && (
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          {isEditing ? (
            <Input
              value={editedProduct.name}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, name: e.target.value })
              }
              className="text-lg font-semibold"
            />
          ) : (
            <h3 className="text-lg font-semibold">{product.name}</h3>
          )}
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t("quantity")}</p>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                value={editedProduct.quantity}
                onChange={(e) =>
                  setEditedProduct({
                    ...editedProduct,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="text-lg font-semibold"
              />
            ) : (
              <p className="text-lg font-semibold">{product.quantity}</p>
            )}
          </div>
          {isAdmin && (
            <div>
              <p className="text-sm text-gray-500">{t("totalValue")}</p>
              <p className="text-lg font-semibold">
                {formatCurrency(product.quantity * product.inboundPrice)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {isAdmin && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t("inboundPrice")}</span>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedProduct.inboundPrice}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      inboundPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-32 text-right"
                />
              ) : (
                <span>{formatCurrency(product.inboundPrice)}</span>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("outboundPrice")}</span>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editedProduct.outboundPrice}
                onChange={(e) =>
                  setEditedProduct({
                    ...editedProduct,
                    outboundPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32 text-right"
              />
            ) : (
              <span>{formatCurrency(product.outboundPrice)}</span>
            )}
          </div>
          {isEditing &&
            editedProduct.outboundPrice <= editedProduct.inboundPrice && (
              <p className="text-sm text-red-500">{t("priceValidation")}</p>
            )}
          {isAdmin && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {t("profitPerUnit")}
                </span>
                <span>{formatCurrency(profit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {t("profitMargin")}
                </span>
                <span>{profitMargin.toFixed(1)}%</span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("supplier")}</span>
            {isEditing ? (
              <Input
                value={editedProduct.supplier}
                onChange={(e) =>
                  setEditedProduct({
                    ...editedProduct,
                    supplier: e.target.value,
                  })
                }
                className="w-48"
              />
            ) : (
              <span>{product.supplier || t("na")}</span>
            )}
          </div>
          {isAdmin && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t("commission")}</span>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editedProduct.commissionPercentage}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      commissionPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-32 text-right"
                />
              ) : (
                <span>{product.commissionPercentage}%</span>
              )}
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t("lastUpdated")}</span>
            <span>
              {format(new Date(product.lastUpdated), "PPP", {
                locale: language === "es" ? es : undefined,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
