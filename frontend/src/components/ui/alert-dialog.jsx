import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'

function AlertDialog({ open, onOpenChange, children, ...props }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </Dialog>
  )
}

function AlertDialogContent({ className, children, ...props }) {
  return (
    <DialogContent className={cn('sm:max-w-lg', className)} {...props}>
      {children}
    </DialogContent>
  )
}

function AlertDialogHeader({ className, ...props }) {
  return <DialogHeader className={cn('space-y-2 text-left', className)} {...props} />
}

function AlertDialogTitle({ className, ...props }) {
  return <DialogTitle className={cn('text-lg font-semibold text-slate-900', className)} {...props} />
}

function AlertDialogDescription({ className, ...props }) {
  return <DialogDescription className={cn('text-sm text-slate-500', className)} {...props} />
}

function AlertDialogFooter({ className, ...props }) {
  return <DialogFooter className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4', className)} {...props} />
}

function AlertDialogAction({ className, ...props }) {
  return <Button className={cn(className)} {...props} />
}

function AlertDialogCancel({ className, ...props }) {
  return <Button type="button" variant="outline" className={cn(className)} {...props} />
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
}
