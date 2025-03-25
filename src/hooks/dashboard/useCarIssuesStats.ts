
import { useState, useEffect } from 'react';
import { TimeFilter } from '@/components/dashboard/CarIssuesDashboard';
import { mockCarIssuesData } from '@/data/mockCarIssuesData';

// Define our statistics types
export interface IssueStats {
  totalIssues: number;
  newIssuesPercent: number;
  avgIssuesPerVehicle: number;
  vehicleCount: number;
  highSeverityCount: number;
  highSeverityPercent: number;
  topIssues: IssueItem[];
  allIssues: IssueItem[];
  issueFrequency: FrequencyDataPoint[];
  issuesByCategory: FrequencyDataPoint[];
  severityDistribution: SeverityDataPoint[];
}

export interface IssueItem {
  id: string;
  name: string;
  count: number;
  percentOfTotal: number;
  severity: 'low' | 'medium' | 'high';
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  description?: string;
}

export interface FrequencyDataPoint {
  name: string;
  value: number;
}

export interface SeverityDataPoint {
  name: string;
  value: number;
  fill: string;
}

export const useCarIssuesStats = (timeFilter: TimeFilter) => {
  const [issueStats, setIssueStats] = useState<IssueStats>({
    totalIssues: 0,
    newIssuesPercent: 0,
    avgIssuesPerVehicle: 0,
    vehicleCount: 0,
    highSeverityCount: 0,
    highSeverityPercent: 0,
    topIssues: [],
    allIssues: [],
    issueFrequency: [],
    issuesByCategory: [],
    severityDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real application, this would be an API call to get real data
        // For now, we'll use mock data based on the timeFilter
        const response = await new Promise<IssueStats>((resolve) => {
          // Simulate API call with timeout
          setTimeout(() => {
            resolve(mockCarIssuesData[timeFilter]);
          }, 800);
        });
        
        setIssueStats(response);
      } catch (err) {
        console.error("Error fetching car issues stats:", err);
        setError(err instanceof Error ? err : new Error('Failed to load statistics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeFilter]);

  return { issueStats, isLoading, error };
};
