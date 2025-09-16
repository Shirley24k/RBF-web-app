import React from "react";

type AppButtonVariant = "primary" | "secondary" | "outline" | "text" | "danger";
type AppButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-lg transition-colors duration-200 font-bold capitalize disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<AppButtonVariant, string> = {
  primary: "bg-dark-plum hover:bg-light-purple text-white font-semibold",
  secondary: "bg-avocado-green hover:text-gray-700 text-gray-900 font-semibold",
  outline:
    "bg-transparent border border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white font-semibold",
  text: "bg-transparent text-dark-plum hover:bg-gray-100 font-semibold",
  danger: "bg-red-600 hover:bg-red-700 text-white font-semibold",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "text-xs py-1.5 px-3",
  md: "text-sm py-2 px-4",
  lg: "text-base py-3 px-6",
};

export const AppButton: React.FC<AppButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...rest
}) => {
  const widthClass = fullWidth ? "w-full" : "";
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default AppButton;


