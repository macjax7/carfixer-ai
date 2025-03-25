
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IssueItem } from '@/hooks/dashboard/useCarIssuesStats';
import { AlertTriangle, CheckCircle, CircleAlert, ChevronDown, ChevronRight } from 'lucide-react';

interface TopIssuesTableProps {
  issues: IssueItem[];
  expandable?: boolean;
}

const TopIssuesTable: React.FC<TopIssuesTableProps> = ({ issues, expandable = false }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Determine badge and icon based on severity
  const getSeverityContent = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
          badge: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">High</span>
        };
      case 'medium':
        return {
          icon: <CircleAlert className="h-4 w-4 text-amber-500" />,
          badge: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">Medium</span>
        };
      case 'low':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          badge: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Low</span>
        };
    }
  };

  // Table display optimized for top 5 issues when not expandable
  const displayIssues = expandable ? issues : issues.slice(0, 5);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {expandable && <TableHead style={{ width: 40 }}></TableHead>}
            <TableHead>Issue</TableHead>
            <TableHead>Count</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayIssues.map((issue) => (
            <React.Fragment key={issue.id}>
              <TableRow 
                className={expandable ? "cursor-pointer hover:bg-muted/60" : undefined}
                onClick={expandable && issue.description ? () => toggleRow(issue.id) : undefined}
              >
                {expandable && (
                  <TableCell>
                    {issue.description ? 
                      (expandedRows[issue.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) 
                      : null
                    }
                  </TableCell>
                )}
                <TableCell className="font-medium">{issue.name}</TableCell>
                <TableCell>{issue.count}</TableCell>
                <TableCell>
                  {getSeverityContent(issue.severity).badge}
                </TableCell>
                <TableCell>{issue.category}</TableCell>
                <TableCell>
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${issue.trend === 'increasing' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' 
                      : issue.trend === 'decreasing'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500'
                    }
                  `}>
                    {issue.trend.charAt(0).toUpperCase() + issue.trend.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
              {expandable && expandedRows[issue.id] && issue.description && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={6} className="p-4">
                    <div className="text-sm text-muted-foreground">
                      <h4 className="font-medium text-foreground mb-1">About this issue:</h4>
                      <p>{issue.description}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TopIssuesTable;
