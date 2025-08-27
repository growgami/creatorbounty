import { useQuery } from '@tanstack/react-query';
import { Bounty } from '@/models/Bounty';

interface AdminDashboardBounty extends Bounty {
  pendingCount: number;
  claimedCount: number;
  rejectedCount: number;
}

interface AdminDashboardData {
  bounties: AdminDashboardBounty[];
  summary: {
    totalBounties: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    claimedSubmissions: number;
    rejectedSubmissions: number;
  };
}

interface UseAdminDashboardResponse {
  data: AdminDashboardData | undefined;
  bounties: AdminDashboardBounty[];
  summary: AdminDashboardData['summary'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await fetch('/api/bounty/admin/dashboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin dashboard data');
  }

  return response.json();
};

export const useAdminDashboard = (): UseAdminDashboardResponse => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    bounties: data?.bounties || [],
    summary: data?.summary,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};