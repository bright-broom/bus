import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Container({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full p-4 bg-card rounded-md shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function List({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid gap-3",
        className
      )}
      {...props}
    />
  )
}

export function ListItem({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-sm bg-background-alt dark:bg-background-alt-dark",
        className
      )}
      {...props}
    />
  )
}

export function RouteIndicator({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded-full mr-2 flex-shrink-0",
        className
      )}
      {...props}
    />
  )
}

export function Overlay({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-overlay z-modal",
        className
      )}
      {...props}
    />
  )
}

export function DropZone({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-border dark:border-border-dark rounded-md p-6 text-center bg-background dark:bg-background-dark hover:bg-background-hover dark:hover:bg-background-hover-dark transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}