import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();

  // Step 1: Check system settings (language selected?)
  const { data: systemSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/system');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  // Step 2: Check license (only if language is selected)
  const { data: licenseData, isLoading: licenseLoading } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed to check license');
      return res.json();
    },
    enabled: !!systemSettings && !!systemSettings.languageSelected,
  });

  // Step 3: Check setup (only if license is valid)
  const { data: setupData, isLoading: setupLoading } = useQuery({
    queryKey: ['checkSetup'],
    queryFn: async () => {
      const response = await fetch('/api/check-setup');
      if (!response.ok) throw new Error('Failed to check setup status');
      return response.json();
    },
    enabled: !!licenseData && licenseData.status !== 'no_license' && licenseData.status !== 'expired' && licenseData.status !== 'clock_tampered' && licenseData.status !== 'invalid',
  });

  useEffect(() => {
    // Wait for settings
    if (settingsLoading) return;

    // Step 1: Language not selected yet → language picker
    if (!systemSettings?.languageSelected) {
      navigate('/language');
      return;
    }

    // Wait for license
    if (licenseLoading) return;

    // Step 2: No license or expired → activation
    if (!licenseData || licenseData.status === 'no_license' || licenseData.status === 'expired' || licenseData.status === 'clock_tampered' || licenseData.status === 'invalid') {
      navigate('/activation');
      return;
    }

    // Wait for setup check
    if (setupLoading) return;

    // Step 3: First run → setup, otherwise → login
    if (setupData?.isFirstRun) {
      navigate('/setup');
    } else {
      navigate('/login');
    }
  }, [systemSettings, settingsLoading, licenseData, licenseLoading, setupData, setupLoading, navigate]);

  return null;
}
