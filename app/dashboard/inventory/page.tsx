"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { ProductDetails } from "@/components/inventory/product-details";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function InventoryPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/me");
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const canViewDetails = user?.role === "admin" || user?.role === "superadmin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("inventory")}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("inventoryDescription")}
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder={t("searchProducts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("sortByName")}</SelectItem>
              <SelectItem value="sku">{t("sortBySKU")}</SelectItem>
              <SelectItem value="quantity">{t("sortByQuantity")}</SelectItem>
              <SelectItem value="lastUpdated">
                {t("sortByLastUpdated")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`grid gap-8 ${canViewDetails ? "lg:grid-cols-3" : ""}`}>
        <div className={canViewDetails ? "lg:col-span-2" : ""}>
          <InventoryTable
            search={search}
            sortBy={sortBy}
            onSelectProduct={setSelectedProduct}
            selectedProduct={selectedProduct}
            userRole={user?.role}
          />
        </div>
        {canViewDetails && (
          <div>
            <ProductDetails
              productId={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              userRole={user?.role}
            />
          </div>
        )}
      </div>
    </div>
  );
}
