/**
 * Customized shadcn/ui Button primitive aligned with forma/ reference screens.
 * Supports high-contrast white primary CTAs, deliberate cyan accent CTAs,
 * and subtle dark-outline buttons.
 *
 * Related: src/lib/utils.ts, src/components/layout/navbar.tsx
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm',
        cyan:
          'bg-accent-cyan text-zinc-950 font-semibold hover:bg-accent-cyanHover shadow-cyanGlow',
        outline:
          'border border-white/10 bg-surface text-white hover:border-white/25 hover:bg-white/5',
        secondary:
          'bg-elevated text-zinc-100 border border-white/10 hover:bg-white/10',
        ghost:
          'text-zinc-300 hover:bg-white/5 hover:text-white',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-6 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders the child element directly using Radix Slot when true. */
  asChild?: boolean;
}

/**
 * Accessible button component styled for forma/'s dark minimalist aesthetic.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
