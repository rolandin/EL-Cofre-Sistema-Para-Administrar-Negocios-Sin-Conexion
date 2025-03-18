"use client";

import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/me");
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isController = user?.role === "controller";

  return {
    user,
    isLoading,
    isAdmin,
    isController,
  };
}
