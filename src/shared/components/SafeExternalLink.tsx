import React from 'react';
import { isSafeUrl } from '@/shared/lib/safeExternalLink';

export type SafeExternalLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | null | undefined;
  openInNewTab?: boolean;
  children: React.ReactNode;
};

/** Renders a safe external link. If href is unsafe, renders as span (no click). */
export function SafeExternalLink({
  href,
  openInNewTab = true,
  children,
  target,
  rel,
  onClick,
  ...props
}: SafeExternalLinkProps) {
  if (!isSafeUrl(href)) {
    return <span {...(props as React.HTMLAttributes<HTMLSpanElement>)}>{children}</span>;
  }
  const safeHref = href!.trim();
  return (
    <a
      href={safeHref}
      target={openInNewTab ? '_blank' : target}
      rel={openInNewTab ? 'noopener noreferrer' : rel}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
