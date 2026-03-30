import React from 'react';
import { sanitizeHtml, type SanitizeConfig } from '@/shared/lib/sanitize';

interface SafeHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string;
  config: SanitizeConfig;
}

export function SafeHtml({ html, config, className, ...props }: SafeHtmlProps) {
  const sanitized = sanitizeHtml(html, config);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      {...props}
    />
  );
}
