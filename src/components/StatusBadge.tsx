import { Chip } from "@material-tailwind/react";
import clsx from "clsx";

interface StatusBadgeProps {
  status: string;
  compact?: boolean; // if true, use Chip style
}

// Define status types and their styling
const statusTypes = {
  "Await Review": {
    bgColor: "bg-[var(--amber-50)]",
    dotColor: "bg-[var(--amber-800)]",
    textColor: "text-[var(--amber-800)]",
  },
  Pending: {
    bgColor: "bg-[var(--deep-orange-50)]",
    dotColor: "bg-[var(--deep-orange-500)]",
    textColor: "text-[var(--deep-orange-500)]",
  },
  "In Progress": {
    bgColor: "bg-blue-50",
    dotColor: "bg-blue-900",
    textColor: "text-blue-900",
  },
  Rejected: {
    bgColor: "bg-red-50",
    dotColor: "bg-red-900",
    textColor: "text-red-900",
  },
  Active: {
    bgColor: "bg-green-50",
    dotColor: "bg-green-900",
    textColor: "text-green-900",
  },
  Completed: {
    bgColor: "bg-[var(--brown-50)]",
    dotColor: "bg-[var(--brown-700)]",
    textColor: "text-[var(--brown-700)]",
  },
};

export const StatusBadge = ({ status, compact = false }: StatusBadgeProps) => {
  const style = statusTypes[status as keyof typeof statusTypes];

  if (!style) return null; // optional guard

  const badgeContent = (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${style.dotColor}`} />
      {!compact && (
        <span className={clsx("text-[14px] font-bold", style.textColor)}>
          {status}
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <Chip
        variant="ghost"
        size="sm"
        className={`${style.bgColor} ${style.textColor} px-2 py-1 font-medium rounded`}
        value={badgeContent}
      />
    );
  }

  return (
    <div
      className={`inline-flex h-6 items-center justify-center px-2 py-1 ${style.bgColor} rounded`}
    >
      {badgeContent}
    </div>
  );
};
