import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  AlertTriangle,
} from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Logo } from "@/components/ui/logo";
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
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
        isActive
          ? "bg-sky-50 text-sky-700 dark:bg-slate-700 dark:text-white"
          : "",
        isCollapsed ? "justify-center" : ""
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: licenseStatus } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 60 * 60 * 1000,
  });

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t("dashboard"),
    },
    {
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
      queryClient.clear(); // Wipe all cached data so next login gets fresh state
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "flex flex-col border-r bg-white dark:bg-slate-800 text-gray-700 dark:text-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center border-b border-gray-200 dark:border-slate-700 px-3 justify-between">
          {!isCollapsed && (
            <Logo height={32} />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
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
        <div className="border-t border-gray-200 dark:border-slate-700 p-2 space-y-2">
          {user && !isCollapsed && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{user.role}</p>
            </div>
          )}
          {user && isCollapsed && (
            <div className="flex justify-center py-2" title={`${user.username} (${user.role})`}>
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700",
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
        {licenseStatus?.status === 'grace_period' && (
          <div className="bg-orange-500 text-white px-4 py-2 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>
              License expired. {15 - licenseStatus.daysOverdue} day(s) remaining before lockout.
              Contact your provider to renew.
            </span>
          </div>
        )}
        {licenseStatus?.status === 'valid' && licenseStatus?.daysRemaining !== null && licenseStatus.daysRemaining <= 15 && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>
              License expires in {licenseStatus.daysRemaining} day(s). Contact your provider to renew.
            </span>
          </div>
        )}
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
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
