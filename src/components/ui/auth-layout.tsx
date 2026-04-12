import { ReactNode } from "react";
import { Logo, LogoIcon } from "@/components/ui/logo";
import { Shield, Wifi, WifiOff, Database, Users } from "lucide-react";

const features = [
  { icon: WifiOff, text: "Works 100% offline — no internet required" },
  { icon: Database, text: "Your data stays local, always under your control" },
  { icon: Users, text: "Multi-user with role-based access" },
  { icon: Shield, text: "Encrypted database with secure backups" },
];

export function AuthLayout({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-10 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-sky-500/10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10" />
        <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full bg-sky-500/5" />

        {/* Top — Logo */}
        <div className="relative z-10">
          <Logo height={40} className="brightness-0 invert opacity-90" />
        </div>

        {/* Middle — Tagline + features */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              Business management
              <br />
              <span className="text-sky-400">without boundaries.</span>
            </h1>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-sm">
              A complete system for inventory, sales, services, employees, and scheduling — designed for regions with limited connectivity.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-sky-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — version */}
        <div className="relative z-10">
          <p className="text-xs text-slate-600">El Cofre v1.0.0</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-md px-6">
          {/* Mobile logo — only shows on small screens */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo height={44} />
          </div>

          {subtitle && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center lg:text-left">
              {subtitle}
            </h2>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
