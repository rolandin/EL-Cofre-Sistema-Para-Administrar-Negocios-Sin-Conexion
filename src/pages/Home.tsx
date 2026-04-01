import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();

  const { data: licenseData, isLoading: licenseLoading } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed to check license');
      return res.json();
    },
  });

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
    if (licenseLoading) return;

    if (!licenseData || licenseData.status === 'no_license' || licenseData.status === 'expired' || licenseData.status === 'clock_tampered' || licenseData.status === 'invalid') {
      navigate('/activation');
      return;
    }

    if (setupLoading) return;
    if (setupData?.isFirstRun) {
      navigate('/setup');
    } else {
      navigate('/login');
    }
  }, [licenseData, licenseLoading, setupData, setupLoading, navigate]);

  return null;
}
