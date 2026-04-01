'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

interface BusinessSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  defaultCommission: number;
  defaultLocationFee: number;
  notes: string;
}

export function BusinessSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    defaultCommission: 0,
    defaultLocationFee: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/business');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch business settings:', error);
        toast.error('Failed to load business settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
        <CardDescription>
          Configure your business information and default values
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tax ID</label>
              <Input
                value={settings.taxId}
                onChange={(e) =>
                  setSettings({ ...settings, taxId: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default Commission (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.defaultCommission}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultCommission: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default Location Fee (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.defaultLocationFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultLocationFee: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={settings.notes}
                onChange={(e) =>
                  setSettings({ ...settings, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}