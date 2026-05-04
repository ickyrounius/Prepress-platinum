import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-11 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
