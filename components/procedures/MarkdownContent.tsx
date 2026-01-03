"use client";

import type { JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps): JSX.Element {
  return (
    <article className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mt-4 text-2xl font-bold text-foreground" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-4 text-xl font-semibold text-foreground" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-3 text-lg font-semibold text-foreground" {...props} />
          ),
          p: ({ node, ...props }) => <p className="text-sm leading-6 text-foreground" {...props} />,
          li: ({ node, ...props }) => <li className="text-sm leading-6 text-foreground" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

