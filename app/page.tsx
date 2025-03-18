'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['checkSetup'],
    queryFn: async () => {
      const response = await fetch('/api/check-setup');
      if (!response.ok) throw new Error('Failed to check setup status');
      return response.json();
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (isError || (data && data.isFirstRun)) {
        router.push('/setup');
      } else {
        router.push('/login');
      }
    }
  }, [data, isLoading, isError, router]);

  return null;
}