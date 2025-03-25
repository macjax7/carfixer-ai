
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getMarkdownComponents } from './repair-instructions/MarkdownComponents';

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

  // Get markdown components with current state
  const markdownComponents = getMarkdownComponents({
    expandedSections,
    toggleSection
  });

  return (
    <div className="mt-4 bg-background/60 border border-border/60 rounded-lg p-3 text-sm">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default RepairInstructions;
