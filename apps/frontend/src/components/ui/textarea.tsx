'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#111] placeholder:text-[#888] outline-none transition focus-visible:border-[#10b981] focus-visible:ring-2 focus-visible:ring-[rgba(16,185,129,0.1)]',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };


