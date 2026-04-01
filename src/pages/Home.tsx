import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();
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
        navigate('/setup');
      } else {
        navigate('/login');
      }
    }
  }, [data, isLoading, isError, navigate]);

  return null;
}
