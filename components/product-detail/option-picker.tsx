import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

import type { OptionGroupState } from "@/lib/product/types";

interface OptionPickerProps extends ComponentProps<"div"> {
  compact?: boolean;
  layout?: "wide" | "square";
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

export function OptionPicker({
  compact = false,
  layout = "wide",
  onSelectValue,
  option,
  className,
  ...props
}: OptionPickerProps) {
  const selectedValue = option.values.find((value) => value.selected)?.name ?? "";
  return (
    <div className={cn("grid gap-2.5", className)} {...props}>
      <p className="text-sm font-semibold text-foreground">
        {option.name}
        {selectedValue ? (
          <span className="font-normal text-foreground/60">: {selectedValue}</span>
        ) : null}
      </p>
      <div
        className={
          layout === "wide"
            ? "grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] gap-2.5"
            : "flex flex-wrap gap-2.5"
        }
      >
        {option.values.map((value) => {
          const classes = cn(
            "grid place-items-center rounded-lg border text-center text-sm transition-colors",
            layout === "square" ? "size-10" : compact ? "px-4 py-2" : "px-4 py-3",
            !value.available
              ? "font-normal border-dashed border-border text-muted-foreground/50 line-through cursor-not-allowed"
              : value.selected
                ? "font-medium border-foreground bg-foreground text-background starting:border-border starting:bg-background starting:text-muted-foreground"
                : "font-normal border-border text-foreground/70 hover:border-foreground hover:text-foreground",
          );

          // Invisible medium-weight twin reserves the bold width so pills don't shift on selection.
          const label = (
            <>
              <span className="col-start-1 row-start-1">{value.name}</span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-medium">
                {value.name}
              </span>
            </>
          );

          if (!value.exists || !value.available) {
            return (
              <span key={value.name} className={classes}>
                {label}
              </span>
            );
          }

          return (
            <Link
              key={value.name}
              href={value.href}
              scroll={false}
              className={classes}
              aria-current={value.selected ? "true" : undefined}
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
