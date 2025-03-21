"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
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
  quantity: number;
  outboundPrice: number;
  sku: string;
}

interface Service {
  id: number;
  name: string;
  base_price: number;
}

interface Contractor {
  id: number;
  name: string;
}

interface SaleItem {
  productId: string;
  quantity: number;
}

interface ServiceItem {
  serviceId: string;
  contractorId: string;
}

export function SaleForm() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  // Fetch data
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      const data = await response.json();
      return data.items || []; // Extract items from paginated response
    },
  });

  const { data: contractors = [] } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const response = await fetch("/api/contractors");
      if (!response.ok) throw new Error("Failed to fetch contractors");
      return response.json();
    },
  });

  // Create sale mutation
  const createSale = useMutation({
    mutationFn: async (data: {
      products: SaleItem[];
      services: ServiceItem[];
    }) => {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      setSaleItems([]);
      setServiceItems([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddProduct = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1 }]);
  };

  const handleAddService = () => {
    setServiceItems([...serviceItems, { serviceId: "", contractorId: "" }]);
  };

  const handleRemoveProduct = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleRemoveService = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate quantities against stock
    const invalidItems = saleItems.filter((item) => {
      const product = products.find((p) => p.id.toString() === item.productId);
      return product && item.quantity > product.quantity;
    });

    if (invalidItems.length > 0) {
      toast.error(t("error"));
      return;
    }

    // Validate that at least one product or service is selected
    if (saleItems.length === 0 && serviceItems.length === 0) {
      toast.error(t("error"));
      return;
    }

    // Validate that all selected products have valid quantities
    if (saleItems.some((item) => !item.productId)) {
      toast.error(t("error"));
      return;
    }

    // Validate that all selected services have valid IDs
    if (serviceItems.some((item) => !item.serviceId)) {
      toast.error(t("error"));
      return;
    }

    createSale.mutate({ products: saleItems, services: serviceItems });
  };

  // Calculate total price
  const totalPrice = [
    ...saleItems.map((item) => {
      const product = products.find((p) => p.id.toString() === item.productId);
      return (product?.outboundPrice || 0) * item.quantity;
    }),
    ...serviceItems.map((item) => {
      const service = services.find((s) => s.id.toString() === item.serviceId);
      return service?.base_price || 0;
    }),
  ].reduce((sum, price) => sum + price, 0);

  const hasAvailableProducts = products.some((p) => p.quantity > 0);
  const hasServices = Array.isArray(services) && services.length > 0;

  // Check if the sale is valid
  const isValidSale =
    // Either has valid products
    (saleItems.length > 0 &&
      saleItems.every((item) => item.productId) &&
      !saleItems.some((item) => {
        const product = products.find(
          (p) => p.id.toString() === item.productId
        );
        return product && item.quantity > product.quantity;
      })) ||
    // Or has valid services
    (serviceItems.length > 0 && serviceItems.every((item) => item.serviceId));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("createSale")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Products */}
        <div className="space-y-4">
          {saleItems.map((item, index) => {
            const selectedProduct = products.find(
              (p) => p.id.toString() === item.productId
            );
            const exceedsStock =
              selectedProduct && item.quantity > selectedProduct.quantity;

            return (
              <div key={index} className="space-y-2">
                <div className="flex gap-4">
                  <Select
                    value={item.productId}
                    onValueChange={(value) =>
                      setSaleItems(
                        saleItems.map((i, idx) =>
                          idx === index ? { ...i, productId: value } : i
                        )
                      )
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t("selectProduct")} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product: Product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                          disabled={product.quantity === 0}
                        >
                          {product.name} ({product.quantity} {t("inStock")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 1}
                    value={item.quantity}
                    onChange={(e) =>
                      setSaleItems(
                        saleItems.map((i, idx) =>
                          idx === index
                            ? { ...i, quantity: parseInt(e.target.value) || 1 }
                            : i
                        )
                      )
                    }
                    className={`w-24 ${exceedsStock ? "border-red-500" : ""}`}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {exceedsStock && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {t("exceedsStock", { stock: selectedProduct.quantity })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <Button
            variant="outline"
            onClick={handleAddProduct}
            className="w-full"
            disabled={!hasAvailableProducts}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("addProduct")}
          </Button>
        </div>

        {/* Services */}
        <div className="space-y-4">
          {serviceItems.map((item, index) => (
            <div key={index} className="flex gap-4">
              <Select
                value={item.serviceId}
                onValueChange={(value) =>
                  setServiceItems(
                    serviceItems.map((i, idx) =>
                      idx === index ? { ...i, serviceId: value } : i
                    )
                  )
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("selectService")} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service: Service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} (${service.base_price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={item.contractorId}
                onValueChange={(value) =>
                  setServiceItems(
                    serviceItems.map((i, idx) =>
                      idx === index ? { ...i, contractorId: value } : i
                    )
                  )
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("selectContractor")} />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor: Contractor) => (
                    <SelectItem
                      key={contractor.id}
                      value={contractor.id.toString()}
                    >
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveService(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleAddService}
            className="w-full"
            disabled={!hasServices}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("addService")}
          </Button>
        </div>

        {/* Total Price */}
        <div className="text-right text-2xl font-bold text-green-600">
          {t("total")}: ${totalPrice.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={createSale.isPending || !isValidSale}
        >
          {createSale.isPending ? t("creatingSale") : t("createSale")}
        </Button>
      </CardFooter>
    </Card>
  );
}
