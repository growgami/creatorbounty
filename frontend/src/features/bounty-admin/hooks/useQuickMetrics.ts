'use client';

import { useState, useEffect, useCallback } from 'react';

interface SubmissionData {
  date: string;
  count: number;
}

interface MetricsData {
  totalSubmissions: number;
  dailySubmissions: number;
  acceptanceRatio: string;
  acceptedSubmissions: number;
  submissionData: SubmissionData[];
}

export const useQuickMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalSubmissions: 0,
    dailySubmissions: 0,
    acceptanceRatio: '0%',
    acceptedSubmissions: 0,
    submissionData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock data for the last 7 days
  const generateSubmissionData = (): SubmissionData[] => {
    const data: SubmissionData[] = [];
    const today = new Date();
    
    // Format date as DD/MM for consistency with ListDetails
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };
    
    // Generate data for the last 7 days with some random variation
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Generate realistic submission counts with some variation
      const baseCount = 15;
      const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
      const count = Math.max(0, baseCount + variation);
      
      data.push({
        date: formatDate(date),
        count
      });
    }
    
    return data;
  };

  // In a real app, this would be an API call
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data
      const submissionData = generateSubmissionData();
      
      // Mock metrics - in a real app these would come from API
      const totalSubmissions = 124;
      const dailySubmissions = submissionData[submissionData.length - 1]?.count || 8;
      const acceptedSubmissions = 89;
      const acceptanceRatio = totalSubmissions > 0 
        ? `${Math.round((acceptedSubmissions / totalSubmissions) * 100)}%` 
        : '0%';
      
      setMetrics({
        totalSubmissions,
        dailySubmissions,
        acceptanceRatio,
        acceptedSubmissions,
        submissionData,
      });
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    ...metrics,
    loading,
    error,
    refreshMetrics: fetchMetrics,
  };
};
