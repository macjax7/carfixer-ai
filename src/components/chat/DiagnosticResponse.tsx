
import React, { useState } from 'react';
import { MessageContentProps } from './types';
import { ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface DiagnosticResponseProps extends MessageContentProps {
  dtcCode?: string;
}

const DiagnosticResponse: React.FC<DiagnosticResponseProps> = ({
  text,
  dtcCode,
  sender
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    technical: false,
    impact: false,
    causes: false,
    steps: false
  });

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Try to extract the DTC code if not provided as prop
  const extractDTCCode = (content: string): string | null => {
    const match = content.match(/\b([PBCU][0-9]{4})\b/i);
    return match ? match[1].toUpperCase() : null;
  };

  const effectiveDtcCode = dtcCode || extractDTCCode(text);
  
  // Simple text-based parsing to identify the different sections in the AI response
  const extractSections = () => {
    // Default sections if we can't parse them properly
    const defaultSections = {
      basic: text,
      technical: '',
      impact: '',
      causes: '',
      steps: ''
    };
    
    // Try to identify section markers in the text
    const basicMatch = text.match(/component|system|what is|what it is|what it does/i);
    const technicalMatch = text.match(/code means|technically|definition|dtc means/i);
    const impactMatch = text.match(/why it matters|impact|affects|effect on|consequences/i);
    const causesMatch = text.match(/causes|common causes|likely causes|reason|culprit/i);
    const stepsMatch = text.match(/next steps|fix this|repair|diagnostic steps|how to|recommend/i);
    
    // If we couldn't find any section markers, return the default
    if (!basicMatch && !technicalMatch && !impactMatch && !causesMatch && !stepsMatch) {
      return defaultSections;
    }
    
    // Get all section starting points in order
    const sections = [
      { name: 'basic', index: basicMatch ? basicMatch.index : -1 },
      { name: 'technical', index: technicalMatch ? technicalMatch.index : -1 },
      { name: 'impact', index: impactMatch ? impactMatch.index : -1 },
      { name: 'causes', index: causesMatch ? causesMatch.index : -1 },
      { name: 'steps', index: stepsMatch ? stepsMatch.index : -1 }
    ].filter(s => s.index >= 0).sort((a, b) => a.index - b.index);
    
    // If we don't have at least two sections, return the default
    if (sections.length < 2) {
      return defaultSections;
    }
    
    // Extract each section's content
    const result = { ...defaultSections };
    
    for (let i = 0; i < sections.length; i++) {
      const currentSection = sections[i];
      const nextSection = sections[i + 1];
      
      const startIndex = currentSection.index;
      const endIndex = nextSection ? nextSection.index : text.length;
      
      result[currentSection.name as keyof typeof defaultSections] = text.substring(startIndex, endIndex).trim();
    }
    
    return result;
  };

  const sections = extractSections();

  // Determine code severity
  const getCodeSeverity = (): 'low' | 'medium' | 'high' => {
    if (!effectiveDtcCode) return 'medium';
    
    // P0xxx codes are generally more serious than P1xxx codes
    // P00xx codes are more serious than P01xx codes
    const firstDigit = effectiveDtcCode.charAt(1);
    const secondDigit = effectiveDtcCode.charAt(2);
    
    // Codes starting with certain letters are generally more serious
    if (effectiveDtcCode.startsWith('P0')) {
      // Engine codes P00xx-P01xx are often more critical
      if (secondDigit === '0' || secondDigit === '1') {
        return 'high';
      }
      return 'medium';
    } else if (effectiveDtcCode.startsWith('P1')) {
      return 'medium';
    } else if (effectiveDtcCode.startsWith('U')) {
      return 'high'; // Network/communication issues are often serious
    } else if (effectiveDtcCode.startsWith('B')) {
      return 'low'; // Body codes are often less urgent
    } else if (effectiveDtcCode.startsWith('C')) {
      return 'medium'; // Chassis codes vary in severity
    }
    
    return 'medium';
  };

  const codeSeverity = getCodeSeverity();
  
  // Styling for severity
  const getSeverityColor = () => {
    switch (codeSeverity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-carfix-600';
    }
  };

  const getSeverityIcon = () => {
    switch (codeSeverity) {
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium': return <Info className="h-5 w-5 text-amber-600" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <HelpCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-3 text-sm md:text-base">
      {/* Code header if we detected a DTC code */}
      {effectiveDtcCode && (
        <div className={`flex items-center gap-2 font-semibold ${getSeverityColor()}`}>
          {getSeverityIcon()}
          <span className="text-base md:text-lg">{effectiveDtcCode}</span>
          <span className="text-xs md:text-sm px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
            {codeSeverity === 'high' ? 'Urgent' : codeSeverity === 'medium' ? 'Attention needed' : 'Maintenance'}
          </span>
        </div>
      )}

      {/* Basic explanation - always expanded by default */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 font-medium text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-carfix-600" />
            <span>Basic Explanation</span>
          </div>
          {expandedSections.basic ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </button>
        
        {expandedSections.basic && (
          <div className="p-3 whitespace-pre-wrap">
            {sections.basic}
          </div>
        )}
      </div>

      {/* Technical details */}
      {sections.technical && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('technical')}
            className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Technical Details</span>
            </div>
            {expandedSections.technical ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {expandedSections.technical && (
            <div className="p-3 whitespace-pre-wrap">
              {sections.technical}
            </div>
          )}
        </div>
      )}

      {/* Why it matters */}
      {sections.impact && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('impact')}
            className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${getSeverityColor()}`} />
              <span>Why It Matters</span>
            </div>
            {expandedSections.impact ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {expandedSections.impact && (
            <div className="p-3 whitespace-pre-wrap">
              {sections.impact}
            </div>
          )}
        </div>
      )}

      {/* Likely causes */}
      {sections.causes && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('causes')}
            className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-600" />
              <span>Likely Causes</span>
            </div>
            {expandedSections.causes ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {expandedSections.causes && (
            <div className="p-3 whitespace-pre-wrap">
              {sections.causes}
            </div>
          )}
        </div>
      )}

      {/* Next steps */}
      {sections.steps && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('steps')}
            className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span>Next Steps</span>
            </div>
            {expandedSections.steps ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {expandedSections.steps && (
            <div className="p-3 whitespace-pre-wrap">
              {sections.steps}
            </div>
          )}
        </div>
      )}

      {/* Fallback for text that doesn't match our structure */}
      {Object.values(sections).every(s => !s) && (
        <div className="whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
};

export default DiagnosticResponse;
