
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink } from 'lucide-react';

interface TextWithLinksProps {
  content: string;
  sender: 'user' | 'ai';
}

const TextWithLinks: React.FC<TextWithLinksProps> = ({ content, sender }) => {
  // Only apply markdown for AI messages
  if (sender === 'user') {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          a: ({ node, ref, href, children, ...props }) => (
            <a 
              href={href}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-carfix-600 hover:text-carfix-700 transition-colors inline-flex items-center gap-1"
              {...props}
            >
              {children}
              <ExternalLink size={14} className="inline" />
            </a>
          ),
          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-md font-bold mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          p: ({ children }) => <p className="my-2">{children}</p>,
          code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{children}</code>,
          pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto my-3">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-carfix-300 pl-4 italic my-3">{children}</blockquote>
          ),
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default TextWithLinks;
