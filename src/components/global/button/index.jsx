"use client";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/global/loader";
import { Button as ShadcnButton } from "@/components/ui/button";

export default function Button({ variant = "default", size = "default", isLoading = false, disabled = false, icon, text, children, className, ...rest }) {
  const isDisabled = disabled || isLoading;
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={cn(className)}
      {...rest}
    >
      {isLoading && (
        <Spinner size="sm" className="mr-2" aria-hidden="true" />
      )}
      {icon && !isLoading && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      {children ?? text}
    </ShadcnButton>
  );
}
