import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InputWithEye } from "@/components/ui/input-with-eye";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/ui/auth-layout";
import { useTranslations } from "@/lib/i18n/use-translations";

interface SetupData {
  username: string;
  password: string;
}

export default function SetupPage() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [error, setError] = useState("");

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
      navigate("/login", { replace: true });
    }
  }, [setupCheck, checkingSetup, navigate]);

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
      navigate("/login");
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
      <div className="min-h-screen bg-background flex flex-col justify-center">
        <div className="text-center">{t("loading")}</div>
      </div>
    );
  }

  return (
    <AuthLayout subtitle={t("createAccount")}>
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t("setupDescription")}
        </p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t("username")}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none block w-full px-3 py-2.5 border border-input rounded-lg shadow-sm placeholder-gray-400 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
            />
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
            <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={isPending}>
            {isPending ? t("creating") : t("createAccount")}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
