"use client";

import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, actionLabel, actionHref, onAction, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {actionLabel && (
          <>
            {actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98] shadow-sm"
              >
                {actionLabel}
              </Link>
            ) : onAction ? (
              <button
                onClick={onAction}
                className="inline-flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98] shadow-sm"
              >
                {actionLabel}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
