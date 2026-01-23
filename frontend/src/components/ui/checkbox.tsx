import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange && !disabled) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors cursor-pointer",
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-primary/80",
            className
          )}
          onClick={() => {
            if (!disabled && onCheckedChange) {
              onCheckedChange(!checked);
            }
          }}
        >
          {checked && <Check className="h-4 w-4" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

