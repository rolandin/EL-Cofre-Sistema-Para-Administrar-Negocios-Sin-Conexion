"use client";

import { useState } from "react";
import { Loader2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Language } from "@/lib/i18n/translations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SystemSettings {
  theme: "light" | "dark" | "system";
  language: Language;
}

export function SystemSettings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SystemSettings>({
    theme: "system",
    language: "es",
  });

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/system");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
      return data;
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: SystemSettings) => {
      const response = await fetch("/api/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["system-settings"], data);
      setTheme(settings.theme);
      setLanguage(settings.language);
      toast.success(t("success"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(settings);
  };

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setSettings((prev) => ({ ...prev, theme: value }));
    setTheme(value);
  };

  const handleLanguageChange = (value: Language) => {
    setSettings((prev) => ({ ...prev, language: value }));
    setLanguage(value);
  };

  const handleBackupNow = async () => {
    try {
      const response = await fetch("/api/backup", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to create backup");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.sqlite`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("success"));
    } catch (error) {
      console.error("Failed to create backup:", error);
      toast.error(t("error"));
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("backup", file);

      const response = await fetch("/api/backup/restore", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to restore backup");
      }

      toast.success("Database restored successfully");
      // Refresh the page to reflect the restored data
      window.location.reload();
    } catch (error) {
      console.error("Failed to restore backup:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to restore backup"
      );
    }

    // Clear the input
    e.target.value = "";
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
        <CardTitle>{t("systemSettings")}</CardTitle>
        <CardDescription>{t("configureSystem")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("theme")}</label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("light")}</SelectItem>
                  <SelectItem value="dark">{t("dark")}</SelectItem>
                  <SelectItem value="system">{t("system")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("language")}</label>
              <Select
                value={settings.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t("spanish")}</SelectItem>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="fr">{t("french")}</SelectItem>
                  <SelectItem value="ru">{t("russian")}</SelectItem>
                  <SelectItem value="zh">{t("chinese")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Database Management</h3>
                  <p className="text-sm text-gray-500">
                    Backup and restore your database
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleBackupNow}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>

                <div className="relative flex-1">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("restore-file")?.click()
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                  <input
                    type="file"
                    id="restore-file"
                    accept=".sqlite"
                    className="hidden"
                    onChange={handleRestore}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("saveChanges")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
