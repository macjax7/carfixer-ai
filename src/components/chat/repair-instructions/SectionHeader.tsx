
import React from 'react';
import { 
  Wrench, 
  BookOpen, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  section: string;
  isExpanded: boolean;
  onToggle: (section: string) => void;
}

export const getSectionIcon = (section: string) => {
  switch (section) {
    case 'tools':
      return <Wrench className="h-4 w-4 text-carfix-600" />;
    case 'steps':
      return <BookOpen className="h-4 w-4 text-carfix-600" />;
    case 'time':
      return <Clock className="h-4 w-4 text-carfix-600" />;
    case 'safety':
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    case 'tips':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'troubleshooting':
      return <HelpCircle className="h-4 w-4 text-amber-500" />;
    default:
      return <Wrench className="h-4 w-4 text-carfix-600" />;
  }
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  section, 
  isExpanded, 
  onToggle 
}) => {
  return (
    <div 
      className="flex items-center justify-between bg-background/80 p-2 rounded-md cursor-pointer border border-border/60"
      onClick={() => onToggle(section)}
    >
      <div className="flex items-center gap-2">
        {getSectionIcon(section)}
        <h3 className="font-medium">{title}</h3>
      </div>
      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </div>
  );
};

export default SectionHeader;
