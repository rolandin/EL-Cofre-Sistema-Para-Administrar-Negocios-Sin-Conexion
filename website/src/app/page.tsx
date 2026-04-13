"use client";

import { useState } from "react";
import { dictionaries, Lang } from "@/lib/i18n";

const WHATSAPP_NUMBER = "18573124946";

export default function Home() {
  const [lang, setLang] = useState<Lang>("es");
  const t = dictionaries[lang];

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path d="M22 2 L40 8 L40 22 C40 34 32 40 22 44 C12 40 4 34 4 22 L4 8 Z" fill="url(#nav-gradient)" />
              <circle cx="22" cy="18" r="5" fill="white" />
              <rect x="20" y="21" width="4" height="8" rx="1" fill="white" />
            </svg>
            <span className="font-bold text-xl text-gray-900">ELCOFRE</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">{t.nav.features}</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">{t.nav.pricing}</a>
            <a href="#download" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">{t.nav.download}</a>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {lang === "es" ? "🇺🇸 EN" : "🇪🇸 ES"}
            </button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t.nav.whatsapp}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
            {t.hero.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {t.hero.title1}
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#download"
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-all shadow-lg shadow-sky-500/25"
            >
              {t.hero.downloadBtn}
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t.hero.licenseBtn}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">{t.features.title}</h2>
            <p className="mt-3 text-gray-600">{t.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.items.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">{t.pricing.title}</h2>
            <p className="mt-3 text-gray-600">{t.pricing.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 border-2 ${
                  "popular" in plan && plan.popular ? "border-sky-500 shadow-lg shadow-sky-500/10" : "border-gray-100"
                } relative`}
              >
                {"popular" in plan && plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t.pricing.popular}
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 block text-center font-semibold py-2.5 rounded-lg transition-colors ${
                    "popular" in plan && plan.popular
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {t.pricing.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t.download.title}</h2>
          <p className="mt-3 text-gray-600">{t.download.subtitle}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Windows */}
            <a
              href="https://github.com/rolandin/EL-Cofre-Sistema-Para-Administrar-Negocios-Sin-Conexion/releases/latest/download/El.Cofre.Setup.1.0.0.exe"
              className="flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-5 transition-all hover:shadow-md w-full sm:w-64 sm:h-20"
            >
              <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              <div className="text-left">
                <div className="font-bold text-gray-900">{t.download.windows}</div>
                <div className="text-xs text-gray-500">{t.download.windowsSub}</div>
              </div>
            </a>
            {/* macOS Apple Silicon */}
            <a
              href="https://github.com/rolandin/EL-Cofre-Sistema-Para-Administrar-Negocios-Sin-Conexion/releases/latest/download/El.Cofre-1.0.0-arm64.dmg"
              className="flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-5 transition-all hover:shadow-md w-full sm:w-64 sm:h-20"
            >
              <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="font-bold text-gray-900">{t.download.macosApple}</div>
                <div className="text-xs text-gray-500">{t.download.macosAppleSub}</div>
              </div>
            </a>
            {/* macOS Intel */}
            <a
              href="https://github.com/rolandin/EL-Cofre-Sistema-Para-Administrar-Negocios-Sin-Conexion/releases/latest/download/El.Cofre-1.0.0.dmg"
              className="flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-5 transition-all hover:shadow-md w-full sm:w-64 sm:h-20"
            >
              <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="font-bold text-gray-900">{t.download.macosIntel}</div>
                <div className="text-xs text-gray-500">{t.download.macosIntelSub}</div>
              </div>
            </a>
          </div>
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">{t.download.howTo}</h3>
            <ol className="text-sm text-gray-600 text-left space-y-2">
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">1.</span>
                {t.download.steps[0]}
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">2.</span>
                {t.download.steps[1]}
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">3.</span>
                {t.download.steps[2]}
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">4.</span>
                <span>
                  {t.download.steps[3]}{" "}
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline block">
                    +1 (857) 312-4946
                  </a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">5.</span>
                {t.download.steps[4]}
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">6.</span>
                {t.download.steps[5]}
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">7.</span>
                {t.download.steps[6]}
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">8.</span>
                {t.download.steps[7]}
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">ELCOFRE</span>
            <span className="text-sm text-gray-500">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">
              {t.footer.whatsapp}: +1 (857) 312-4946
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
