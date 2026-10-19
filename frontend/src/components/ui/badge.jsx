import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#166534] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#166534] text-white shadow hover:bg-[#14532d]',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700',
        destructive:
          'border-red-200 bg-red-50 text-red-700',
        outline:
          'text-slate-800 border-slate-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
