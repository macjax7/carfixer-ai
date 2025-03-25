
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-primary p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-primary-foreground"
        >
          <path d="m18.5 9-5 5c-.5.5-1.3.5-1.8 0l-5-5" />
          <circle cx="7" cy="4" r="2" />
          <circle cx="17" cy="4" r="2" />
          <path d="M14 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4" />
          <path d="M13.3 17H4a2 2 0 0 0-2 2v2h20v-2a2 2 0 0 0-2-2h-6.7" />
        </svg>
      </div>
      <span className="text-xl font-bold">CarFix</span>
    </div>
  );
};
