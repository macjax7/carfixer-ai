
import React from 'react';
import { getBorderColorClass } from './SectionUtils';

interface SectionContentProps {
  section: string;
  isExpanded: boolean;
  children: React.ReactNode;
}

const SectionContent: React.FC<SectionContentProps> = ({ 
  section, 
  isExpanded, 
  children 
}) => {
  if (!isExpanded) return null;
  
  const borderColorClass = getBorderColorClass(section);
  
  return (
    <div className={`mt-2 pl-2 border-l-2 ${borderColorClass}`}>
      {children}
    </div>
  );
};

export default SectionContent;
