import { cn } from '@/lib/utils';

type Status = 'pending' | 'processing' | 'processed' | 'sold' | 'active' | 'inactive' | 'available' | 'reserved' | 'paid' | 'partial';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-info/10 text-info',
  processed: 'bg-success/10 text-success',
  sold: 'bg-primary/10 text-primary',
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  available: 'bg-success/10 text-success',
  reserved: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  partial: 'bg-warning/10 text-warning',
};

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  processing: 'Processing',
  processed: 'Processed',
  sold: 'Sold',
  active: 'Active',
  inactive: 'Inactive',
  available: 'Available',
  reserved: 'Reserved',
  paid: 'Paid',
  partial: 'Partial',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
