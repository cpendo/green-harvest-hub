import { cn } from '@/lib/utils';
import { TeaGrade } from '@/types';

interface GradeBadgeProps {
  grade: TeaGrade;
  className?: string;
}

const gradeStyles: Record<TeaGrade, string> = {
  A: 'badge-grade-a',
  B: 'badge-grade-b',
  C: 'badge-grade-c',
};

const gradeLabels: Record<TeaGrade, string> = {
  A: 'Grade A - Premium',
  B: 'Grade B - Standard',
  C: 'Grade C - Basic',
};

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  return (
    <span className={cn('badge-grade', gradeStyles[grade], className)}>
      {gradeLabels[grade]}
    </span>
  );
}
