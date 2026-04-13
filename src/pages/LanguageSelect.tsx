import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const languages = [
  { code: 'es', name: 'Español', native: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelect() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState('es');

  const { mutate: saveLanguage, isPending } = useMutation({
    mutationFn: async (language: string) => {
      const res = await fetch('/api/settings/system/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) throw new Error('Failed to save language');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to save language selection');
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo height={50} />
        </div>

        {/* Title — shown in multiple languages so everyone understands */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Selecciona tu idioma
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select your language · Choisissez votre langue
          </p>
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-3 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150',
                'hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20',
                selected === lang.code
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              {selected === lang.code && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-sky-500" />
                </div>
              )}
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {lang.native}
              </span>
              {lang.native !== lang.name && (
                <span className="text-xs text-gray-400">{lang.name}</span>
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <Button
          className="w-full h-12 text-base"
          onClick={() => saveLanguage(selected)}
          disabled={isPending}
        >
          {isPending ? '...' : selected === 'es' ? 'Continuar' : selected === 'en' ? 'Continue' : selected === 'fr' ? 'Continuer' : selected === 'pt' ? 'Continuar' : selected === 'ru' ? 'Продолжить' : selected === 'zh' ? '继续' : selected === 'hi' ? 'जारी रखें' : selected === 'bn' ? 'চালিয়ে যান' : selected === 'ar' ? 'متابعة' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
