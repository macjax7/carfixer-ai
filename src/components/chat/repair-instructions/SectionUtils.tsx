
export const getSectionType = (content: string): { type: string; title: string } | null => {
  const lowercaseContent = content.toLowerCase();
  
  if (lowercaseContent.includes('tool') || lowercaseContent.includes('material')) {
    return { type: 'tools', title: content };
  }
  
  if (lowercaseContent.includes('instruction') || lowercaseContent.includes('step')) {
    return { type: 'steps', title: content };
  }
  
  if (lowercaseContent.includes('time')) {
    return { type: 'time', title: content };
  }
  
  if (lowercaseContent.includes('safety') || lowercaseContent.includes('precaution')) {
    return { type: 'safety', title: content };
  }
  
  if (lowercaseContent.includes('tip')) {
    return { type: 'tips', title: content };
  }
  
  if (lowercaseContent.includes('troubleshoot')) {
    return { type: 'troubleshooting', title: content };
  }
  
  return null;
};

export const getBorderColorClass = (section: string): string => {
  switch (section) {
    case 'safety':
      return 'border-red-100';
    case 'tips':
      return 'border-green-100';
    case 'troubleshooting':
      return 'border-amber-100';
    default:
      return 'border-carfix-100';
  }
};
