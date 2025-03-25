
import React from 'react';
import { Components } from 'react-markdown';
import { getSectionType } from './SectionUtils';
import SectionHeader from './SectionHeader';
import SectionContent from './SectionContent';

interface MarkdownComponentsProps {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

export const getMarkdownComponents = ({
  expandedSections,
  toggleSection
}: MarkdownComponentsProps): Components => {
  return {
    h2: ({ node, ...props }) => {
      const content = props.children?.toString() || '';
      const sectionInfo = getSectionType(content);
      
      if (sectionInfo) {
        return (
          <div className="mt-3 mb-2">
            <SectionHeader
              title={sectionInfo.title}
              section={sectionInfo.type}
              isExpanded={!!expandedSections[sectionInfo.type]}
              onToggle={toggleSection}
            />
            <SectionContent 
              section={sectionInfo.type} 
              isExpanded={!!expandedSections[sectionInfo.type]}
            >
              {props.children}
            </SectionContent>
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
  };
};
