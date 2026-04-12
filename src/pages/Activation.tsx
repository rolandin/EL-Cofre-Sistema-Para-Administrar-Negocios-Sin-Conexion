import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';
import { AuthLayout } from '@/components/ui/auth-layout';
import { toast } from 'sonner';

export default function Activation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: licenseStatus, isLoading } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed to check license');
      return res.json();
    },
  });

  const { mutate: activate, isPending } = useMutation({
    mutationFn: async (licenseKey: string) => {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Activation failed');
      return data;
    },
    onSuccess: async () => {
      toast.success('License activated successfully!');
      queryClient.invalidateQueries({ queryKey: ['licenseStatus'] });
      try {
        const res = await fetch('/api/check-setup');
        const data = await res.json();
        navigate(data.isFirstRun ? '/setup' : '/login');
      } catch {
        navigate('/');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleCopy = async () => {
    if (licenseStatus?.machineId) {
      await navigator.clipboard.writeText(licenseStatus.machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    activate(key);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthLayout subtitle="License Activation">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        {/* Machine Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Your Machine Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 font-mono text-base text-center tracking-wider text-gray-900 dark:text-white">
              {licenseStatus?.machineId || '...'}
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11" onClick={handleCopy} title="Copy machine code">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Share this code with your provider to receive a license key.
          </p>
        </div>

        {/* Key Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Enter License Key
            </label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
              className="font-mono text-center tracking-wider h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isPending || !key.trim()}>
            {isPending ? 'Activating...' : 'Activate License'}
          </Button>
        </form>

        {/* Status Messages */}
        {licenseStatus?.status === 'clock_tampered' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            System date error detected. Please correct your system clock and contact support.
          </div>
        )}
        {licenseStatus?.status === 'expired' && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300">
            Your license has expired. Please enter a new license key to continue.
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
