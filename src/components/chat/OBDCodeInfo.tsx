
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, ChevronDown, ChevronUp, AlertCircle, Wrench, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { estimateCodeSeverity, getCodeCategory, getCodeExplanation, getPCodeInfo, getCommonCodeSymptoms } from "@/utils/openai/obd";

interface OBDCodeInfoProps {
  code: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

const OBDCodeInfo: React.FC<OBDCodeInfoProps> = ({
  code,
  description,
  severity: providedSeverity
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Get code information from our utilities
  const { system } = getCodeCategory(code);
  const severity = providedSeverity || estimateCodeSeverity(code);
  const explanation = getCodeExplanation(code);
  const symptoms = getCommonCodeSymptoms(code);
  
  // Get additional P-code info if applicable
  const pCodeInfo = code.startsWith('P') ? getPCodeInfo(code) : null;
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <ThumbsUp size={16} />;
      case 'medium': return <AlertCircle size={16} />;
      case 'high': return <AlertTriangle size={16} />;
      default: return <Info size={16} />;
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
            {system}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {description || explanation.meaning}
        </CardDescription>
      </CardHeader>
      
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={getSeverityColor(severity)}>
              <span className="flex items-center gap-1">
                {getSeverityIcon(severity)}
                {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
              </span>
            </Badge>
            
            {pCodeInfo && (
              <Badge variant="outline" className="text-xs">
                {pCodeInfo.manufacturer ? 'Manufacturer Specific' : 'Generic'}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Wrench size={14} />
            <span>Affected: <span className="font-medium text-foreground">{explanation.component}</span></span>
          </div>
          
          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              {/* Layered explanation section */}
              <div>
                <h4 className="text-sm font-semibold mb-1">What this means</h4>
                <p className="text-sm text-muted-foreground">{explanation.meaning}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Why it matters</h4>
                <p className="text-sm text-muted-foreground">{explanation.impact}</p>
              </div>
              
              {/* Common symptoms */}
              <div>
                <h4 className="text-sm font-semibold mb-1">Common Symptoms</h4>
                <div className="flex flex-wrap gap-1">
                  {symptoms.map((symptom, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Possible causes section */}
              <div>
                <h4 className="text-sm font-semibold mb-1">Possible Causes</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {explanation.possibleCauses.map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>
              
              {/* Technical information for advanced users */}
              {pCodeInfo && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Technical Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {code} is a {pCodeInfo.category} code related to the {pCodeInfo.subcategory} system.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
        
        <CardFooter className="pt-0 pb-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-1">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expanded ? "Show Less" : "Show More"}
            </Button>
          </CollapsibleTrigger>
        </CardFooter>
      </Collapsible>
    </Card>
  );
};

export default OBDCodeInfo;
