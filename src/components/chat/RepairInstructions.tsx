
import React, { useState } from 'react';
import { Wrench, BookOpen, Clock, ShieldAlert, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RepairInstructionsProps {
  content: string;
}

const RepairInstructions: React.FC<RepairInstructionsProps> = ({ content }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tools: true,
    steps: true
  });

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper to render section headers with appropriate icons
  const renderSectionHeader = (title: string, section: string, icon: React.ReactNode) => (
    <div 
      className="flex items-center justify-between bg-background/80 p-2 rounded-md cursor-pointer border border-border/60"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      {expandedSections[section] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </div>
  );

  return (
    <div className="mt-4 bg-background/60 border border-border/60 rounded-lg p-3 text-sm">
      <ReactMarkdown
        components={{
          h2: ({ node, ...props }) => {
            const content = props.children?.toString() || '';
            
            if (content.toLowerCase().includes('tool') || content.toLowerCase().includes('material')) {
              return (
                <div className="mt-3 mb-2">
                  {renderSectionHeader(content, 'tools', <Wrench className="h-4 w-4 text-carfix-600" />)}
                  {expandedSections['tools'] && <div className="mt-2 pl-2 border-l-2 border-carfix-100">{props.children}</div>}
                </div>
              );
            }
            
            if (content.toLowerCase().includes('instruction') || content.toLowerCase().includes('step')) {
              return (
                <div className="mt-3 mb-2">
                  {renderSectionHeader(content, 'steps', <BookOpen className="h-4 w-4 text-carfix-600" />)}
                  {expandedSections['steps'] && <div className="mt-2 pl-2 border-l-2 border-carfix-100">{props.children}</div>}
                </div>
              );
            }
            
            if (content.toLowerCase().includes('time')) {
              return (
                <div className="mt-3 mb-2">
                  {renderSectionHeader(content, 'time', <Clock className="h-4 w-4 text-carfix-600" />)}
                  {expandedSections['time'] && <div className="mt-2 pl-2 border-l-2 border-carfix-100">{props.children}</div>}
                </div>
              );
            }
            
            if (content.toLowerCase().includes('safety') || content.toLowerCase().includes('precaution')) {
              return (
                <div className="mt-3 mb-2">
                  {renderSectionHeader(content, 'safety', <ShieldAlert className="h-4 w-4 text-red-500" />)}
                  {expandedSections['safety'] && <div className="mt-2 pl-2 border-l-2 border-red-100">{props.children}</div>}
                </div>
              );
            }
            
            if (content.toLowerCase().includes('tip')) {
              return (
                <div className="mt-3 mb-2">
                  {renderSectionHeader(content, 'tips', <CheckCircle className="h-4 w-4 text-green-500" />)}
                  {expandedSections['tips'] && <div className="mt-2 pl-2 border-l-2 border-green-100">{props.children}</div>}
                </div>
              );
            }
            
            if (content.toLowerCase().includes('troubleshoot')) {
              return (
                <div className="mt-3 mb-2">
                  {renderSectionHeader(content, 'troubleshooting', <HelpCircle className="h-4 w-4 text-amber-500" />)}
                  {expandedSections['troubleshooting'] && <div className="mt-2 pl-2 border-l-2 border-amber-100">{props.children}</div>}
                </div>
              );
            }
            
            return <h3 className="text-base font-medium mt-3 mb-2">{props.children}</h3>;
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 space-y-1 my-2">{props.children}</ul>
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 space-y-2 my-2">{props.children}</ol>
          ),
          li: ({ node, ...props }) => (
            <li className="my-1">{props.children}</li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-red-600">{props.children}</strong>
          ),
          p: ({ node, ...props }) => (
            <p className="my-2">{props.children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default RepairInstructions;
