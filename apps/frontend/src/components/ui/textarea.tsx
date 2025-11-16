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
          'flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none transition focus-visible:ring-1 focus-visible:ring-emerald-500/60',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };


