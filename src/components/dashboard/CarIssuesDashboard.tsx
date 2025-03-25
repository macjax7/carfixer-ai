
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCarIssuesStats } from '@/hooks/dashboard/useCarIssuesStats';
import IssueFrequencyChart from './IssueFrequencyChart';
import TopIssuesTable from './TopIssuesTable';
import IssueSeverityDistribution from './IssueSeverityDistribution';
import DashboardLoader from './DashboardLoader';

export type TimeFilter = 'week' | 'month' | 'year' | 'all';

const CarIssuesDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const { issueStats, isLoading, error } = useCarIssuesStats(timeFilter);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Error Loading Dashboard</CardTitle>
          <CardDescription>
            There was a problem loading the car issues dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Car Issues Dashboard</h1>
        <p className="text-muted-foreground">
          Track and analyze common vehicle problems detected through chat conversations
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Common Issues</TabsTrigger>
          <TabsTrigger value="severity">Severity Analysis</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-end mb-4">
          <div className="bg-background border rounded-md flex items-center p-1">
            <button 
              onClick={() => setTimeFilter('week')} 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeFilter('month')} 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeFilter('year')} 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'year' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              Year
            </button>
            <button 
              onClick={() => setTimeFilter('all')} 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              All Time
            </button>
          </div>
        </div>

        {isLoading ? (
          <DashboardLoader />
        ) : (
          <>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Detected Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{issueStats.totalIssues}</div>
                    <p className="text-xs text-muted-foreground">
                      +{issueStats.newIssuesPercent}% from previous period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Issues Per Vehicle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{issueStats.avgIssuesPerVehicle}</div>
                    <p className="text-xs text-muted-foreground">
                      Across {issueStats.vehicleCount} vehicles
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      High Severity Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{issueStats.highSeverityCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {issueStats.highSeverityPercent}% of all issues
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Most Common Issues</CardTitle>
                    <CardDescription>Top issues detected in user conversations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopIssuesTable issues={issueStats.topIssues} />
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Issue Frequency</CardTitle>
                    <CardDescription>Distribution of issues over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IssueFrequencyChart data={issueStats.issueFrequency} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Categories</CardTitle>
                  <CardDescription>Breakdown of issues by category</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <IssueFrequencyChart data={issueStats.issuesByCategory} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Issues Details</CardTitle>
                  <CardDescription>Comprehensive list of detected vehicle issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopIssuesTable issues={issueStats.allIssues} expandable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="severity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Severity Distribution</CardTitle>
                  <CardDescription>Breakdown of issues by severity level</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <IssueSeverityDistribution data={issueStats.severityDistribution} />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default CarIssuesDashboard;
