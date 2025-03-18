"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  PackagePlus,
  RotateCcw,
  Settings,
  Wallet,
  Wrench,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

function NavItem({ href, icon, label, isCollapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white dark:text-gray-400 dark:hover:text-gray-50",
        isActive ? "bg-slate-700 text-white" : "",
        isCollapsed ? "justify-center" : ""
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { t } = useTranslations();

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t("dashboard"),
    },
    isAdmin && {
      href: "/dashboard/receive",
      icon: <PackagePlus className="h-5 w-5" />,
      label: t("receive"),
    },
    {
      href: "/dashboard/inventory",
      icon: <PackageSearch className="h-5 w-5" />,
      label: t("inventory"),
    },
    {
      href: "/dashboard/returns",
      icon: <RotateCcw className="h-5 w-5" />,
      label: t("returns"),
    },
    {
      href: "/dashboard/services",
      icon: <Wrench className="h-5 w-5" />,
      label: t("services"),
    },
    {
      href: "/dashboard/schedule",
      icon: <CalendarDays className="h-5 w-5" />,
      label: t("schedule"),
    },
    isAdmin && {
      href: "/dashboard/contractors",
      icon: <Briefcase className="h-5 w-5" />,
      label: t("contractors"),
    },
    isAdmin && {
      href: "/dashboard/employees",
      icon: <Users className="h-5 w-5" />,
      label: t("employees"),
    },
    isAdmin && {
      href: "/dashboard/payments",
      icon: <Wallet className="h-5 w-5" />,
      label: t("payments"),
    },
    isAdmin && {
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      label: t("settings"),
    },
  ].filter(Boolean);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "flex flex-col border-r bg-slate-800 text-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center border-b border-slate-700 px-3 justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-pink-500">EL</h2>
              <h2 className="text-lg font-bold text-blue-300">COFRE</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-slate-700"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
        <div className="border-t border-slate-700 p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-white hover:bg-slate-700",
              isCollapsed && "justify-center"
            )}
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="h-5 w-4" />
            {!isCollapsed && <span>{t("logout")}</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">{children}</div>
      </main>

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmLogout")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("logoutMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              {t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
