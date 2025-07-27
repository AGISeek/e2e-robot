"use client";

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { FileContent } from '@/types/sse';
import 'github-markdown-css/github-markdown.css';
import '@/styles/github-markdown.css';

interface FileContentRendererProps {
  file: FileContent;
  className?: string;
}

const FileContentRenderer = memo(({ file, className = "" }: FileContentRendererProps) => {
  const renderContent = () => {
    switch (file.type) {
      case 'markdown':
        return (
          <div 
            className={`markdown-body ${className}`} 
            data-color-mode="auto" 
            data-light-theme="light" 
            data-dark-theme="dark"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-fg-default)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  // For code blocks (with language)
                  if (language) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={language}
                        PreTag="div"
                        className="rounded-md text-sm !mt-0 !mb-4"
                        showLineNumbers={false}
                        customStyle={{
                          margin: 0,
                          padding: '12px 16px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          lineHeight: '1.45'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  
                  // For inline code
                  return (
                    <code 
                      className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono border border-neutral-200 dark:border-neutral-700"
                      style={{
                        backgroundColor: 'var(--color-neutral-muted)',
                        color: 'var(--color-fg-default)',
                        fontSize: '85%',
                        padding: '0.2em 0.4em',
                        borderRadius: '6px'
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Custom table styling to match GitHub
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
                      {children}
                    </table>
                  </div>
                ),
                // Custom blockquote styling
                blockquote: ({ children }) => (
                  <blockquote 
                    className="border-l-4 pl-4 my-4"
                    style={{
                      borderLeftColor: 'var(--color-border-default)',
                      color: 'var(--color-fg-muted)',
                      margin: '16px 0',
                      paddingLeft: '16px'
                    }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {file.content}
            </ReactMarkdown>
          </div>
        );

      case 'typescript':
        return (
          <SyntaxHighlighter
            language="typescript"
            style={oneDark as any}
            className={`rounded-md text-sm ${className}`}
            showLineNumbers
            wrapLines
            lineNumberStyle={{ 
              color: '#6b7280', 
              fontSize: '0.75rem',
              paddingRight: '1rem'
            }}
          >
            {file.content}
          </SyntaxHighlighter>
        );

      case 'json':
        let formattedJson = file.content;
        try {
          // Try to format JSON if it's valid
          formattedJson = JSON.stringify(JSON.parse(file.content), null, 2);
        } catch {
          // If parsing fails, use original content
        }
        
        return (
          <SyntaxHighlighter
            language="json"
            style={oneDark as any}
            className={`rounded-md text-sm ${className}`}
            showLineNumbers
            wrapLines
            lineNumberStyle={{ 
              color: '#6b7280', 
              fontSize: '0.75rem',
              paddingRight: '1rem'
            }}
          >
            {formattedJson}
          </SyntaxHighlighter>
        );

      default:
        return (
          <pre className={`whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200 font-mono p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-md border border-neutral-200 dark:border-neutral-700 ${className}`}>
            {file.content}
          </pre>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto min-h-0">
      {renderContent()}
    </div>
  );
});

FileContentRenderer.displayName = 'FileContentRenderer';

export { FileContentRenderer };