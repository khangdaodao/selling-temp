/**
 * Customized shadcn/ui Badge primitive for tier, framework, and demo-mode indicators.
 *
 * Related: src/lib/utils.ts, src/components/layout/demo-mode-bar.tsx
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-white/15 bg-white/10 text-white',
        cyan: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
        outline: 'border-white/10 bg-transparent text-zinc-300',
        muted: 'border-white/5 bg-elevated text-zinc-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Compact pill badge used for product tiers, framework labels, and demo warnings.
 */
export function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
