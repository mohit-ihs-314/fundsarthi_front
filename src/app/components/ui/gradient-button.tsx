import * as React from "react";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function GradientButton({ 
  children, 
  variant = "primary",
  className = "", 
  disabled,
  ...props 
}: GradientButtonProps) {
  const baseClasses = "h-12 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = variant === "primary"
    ? "bg-gradient-to-r from-accent to-primary text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    : "bg-card border border-border hover:shadow-md";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
