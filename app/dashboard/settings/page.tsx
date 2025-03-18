"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserManagement } from "@/components/settings/user-management";
import { SystemSettings } from "@/components/settings/system-settings";
import { SalesReport } from "@/components/settings/sales-report";
import { NewUserForm } from "@/components/settings/new-user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function SettingsPage() {
  const { t } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUserSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("settings")}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("settingsDescription")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("newUser")}
          </Button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("newUser")}</DialogTitle>
            </DialogHeader>
            <NewUserForm onSuccess={handleUserSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">{t("userManagement")}</TabsTrigger>
          <TabsTrigger value="reports">{t("salesReport")}</TabsTrigger>
          <TabsTrigger value="system">{t("systemSettings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="reports">
          <SalesReport />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
