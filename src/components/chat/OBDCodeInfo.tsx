
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";

interface OBDCodeInfoProps {
  code: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

const OBDCodeInfo: React.FC<OBDCodeInfoProps> = ({
  code,
  description,
  severity = 'medium'
}) => {
  // Determine the category of the code
  const getCodeCategory = (code: string) => {
    const prefix = code[0].toUpperCase();
    switch (prefix) {
      case 'P': return 'Powertrain';
      case 'B': return 'Body';
      case 'C': return 'Chassis';
      case 'U': return 'Network';
      default: return 'Unknown';
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="mb-4 shadow-sm border-l-4 border-l-carfix-600">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="text-carfix-600" />
            Code {code}
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            {getCodeCategory(code)}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {description || "Diagnostic Trouble Code"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={getSeverityColor(severity)}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Info size={14} />
            {severity === 'high' ? 'Requires immediate attention' : 
             severity === 'medium' ? 'Should be addressed soon' : 
             'Can be monitored'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OBDCodeInfo;
