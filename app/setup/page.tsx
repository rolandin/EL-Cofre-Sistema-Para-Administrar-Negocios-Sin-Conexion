"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InputWithEye } from "@/components/ui/input-with-eye";
import { Button } from "@/components/ui/button";
import { Warehouse } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface SetupData {
  username: string;
  password: string;
}

export default function SetupPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [error, setError] = useState("");

  // Check if we should be on this page
  const { data: setupCheck, isLoading: checkingSetup } = useQuery({
    queryKey: ["checkSetup"],
    queryFn: async () => {
      const response = await fetch("/api/check-setup");
      if (!response.ok) throw new Error("Failed to check setup status");
      return response.json();
    },
  });

  useEffect(() => {
    if (!checkingSetup && setupCheck && !setupCheck.isFirstRun) {
      router.replace("/login");
    }
  }, [setupCheck, checkingSetup, router]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SetupData) => {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("error"));
      }

      return response.json();
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    mutate({ username, password });
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center">
        <div className="text-center">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Warehouse className="h-12 w-12 text-blue-600" />
        </div>
        <div className="flex items-center justify-center mt-6">
          <h2 className="text-center text-3xl font-extrabold text-pink-500">
            EL
          </h2>
          <h2 className="text-center text-3xl font-extrabold text-blue-500">
            COFRE
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {t("username")}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <InputWithEye
              id="password"
              name="password"
              required
              label={t("password")}
            />

            <InputWithEye
              id="confirmPassword"
              name="confirmPassword"
              required
              label={t("confirmPassword")}
            />

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("creating") : t("createAccount")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
