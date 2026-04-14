import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputWithEye } from "@/components/ui/input-with-eye";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/ui/auth-layout";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "inactiveUserError") {
          throw new Error(t("inactiveUserError"));
        }
        throw new Error(t("error"));
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle={t("signIn")}>
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
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
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          <InputWithEye
            id="password"
            name="password"
            required
            label={t("password")}
          />

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
