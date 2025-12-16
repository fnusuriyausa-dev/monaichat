import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm max-w-none break-words ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />
          ),
          ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 my-2" />,
          ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 my-2" />,
          p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            return isInline ? (
              <code {...props} className="bg-slate-200 text-slate-800 rounded px-1 py-0.5 text-xs font-mono">
                {children}
              </code>
            ) : (
               <code {...props} className="block bg-slate-800 text-slate-100 rounded p-2 text-xs font-mono overflow-x-auto my-2">
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;