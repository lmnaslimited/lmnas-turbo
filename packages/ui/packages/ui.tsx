import React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost"
  size?: "default" | "icon"
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "default", size = "default", asChild, className, ...props }, ref) => {
    const buttonVariants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      ghost: "text-primary hover:bg-primary/10",
    }
    const buttonSizes = {
      default: "px-4 py-2 rounded-md text-sm",
      icon: "px-2 py-2 rounded-full",
    }

    const Comp = asChild ? (React.Children.only(children) as React.ReactElement) : "button"
    const childProps = asChild ? { className: `${buttonVariants[variant]} ${buttonSizes[size]} ${className}` } : {}

    return asChild ? (
      React.cloneElement(Comp, {
        ...childProps,
        ...props,
        ref,
      })
    ) : (
      <Comp className={`${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} ref={ref} {...props}>
        {children}
      </Comp>
    )
  },
)

Button.displayName = "Button"

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`border rounded-lg shadow-md p-4 ${className}`}>{children}</div>
)

export const CardHeader = ({ children }: { children: React.ReactNode }) => <header className="mb-2">{children}</header>

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
)

export const CardContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

export const CardFooter = ({ children }: { children: React.ReactNode }) => <footer className="mt-2">{children}</footer>

