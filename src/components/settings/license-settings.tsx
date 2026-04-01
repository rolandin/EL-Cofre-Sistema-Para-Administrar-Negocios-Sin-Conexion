import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function LicenseSettings() {
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const { data: status, isLoading } = useQuery({
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
    onSuccess: () => {
      toast.success('License key updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['licenseStatus'] });
      setKey('');
      setShowKeyInput(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleCopy = async () => {
    if (status?.machineId) {
      await navigator.clipboard.writeText(status.machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;
    switch (status.status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'grace_period':
        return <Badge className="bg-orange-100 text-orange-800">Grace Period</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">License Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Machine Code</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded font-mono text-sm">
                {status?.machineId || '...'}
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            {getStatusBadge()}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">License Type</p>
            <p className="font-medium">
              {status?.license?.keyType === 'lifetime' ? 'Lifetime' : status?.license?.keyType === '6month' ? '6-Month' : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Expires</p>
            <p className="font-medium">
              {status?.license?.expiresAt || 'Never'}
            </p>
          </div>

          {status?.daysRemaining !== undefined && status?.daysRemaining !== null && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Days Remaining</p>
              <p className={`font-medium ${status.daysRemaining <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                {status.daysRemaining}
              </p>
            </div>
          )}

          {status?.status === 'grace_period' && (
            <div className="col-span-2">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3 text-sm text-orange-700 dark:text-orange-300">
                License expired {status.daysOverdue} day(s) ago. You have {15 - status.daysOverdue} day(s) remaining before lockout.
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Renew License</h3>
        {showKeyInput ? (
          <form onSubmit={(e) => { e.preventDefault(); if (key.trim()) activate(key); }} className="space-y-4">
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
              className="font-mono tracking-wider"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending || !key.trim()}>
                {isPending ? 'Activating...' : 'Activate Key'}
              </Button>
              <Button variant="outline" onClick={() => { setShowKeyInput(false); setKey(''); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowKeyInput(true)}>Enter New Key</Button>
        )}
      </Card>
    </div>
  );
}
