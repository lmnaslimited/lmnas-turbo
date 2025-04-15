"use client"

import type React from "react"
import {
    useState,
    useRef,
    useEffect,
    type InputHTMLAttributes,
    forwardRef,
} from "react"
import { cn } from "@repo/ui/lib/utils"

export interface FloatingLabelInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: boolean
    className?: string
    inputClassName?: string
    labelClassName?: string
}

const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ label: iLabel, error: iError, className: iClassName, inputClassName: iInputClassName, labelClassName: iLabelClassName, ...iProps }, ref) => {

        const [FormIsFocused, fnSetFormIsFocused] = useState(false)
        const [FormHasValue, fnSetFormHasValue] = useState(!!iProps.value || !!iProps.defaultValue)

        const LInputRef = useRef<HTMLInputElement>(null)

        const LCombinedRef = (iNode: HTMLInputElement) => {
            if (typeof ref === "function") {
                ref(iNode)
            } else if (ref) {
                ref.current = iNode
            }
            LInputRef.current = iNode
        }

        useEffect(() => {
            fnSetFormHasValue(!!iProps.value)
        }, [iProps.value])

        const fnHandleFocus = (iEvent: React.FocusEvent<HTMLInputElement>) => {
            fnSetFormIsFocused(true)
            iProps.onFocus?.(iEvent)
        }

        const fnHandleBlur = (iEvent: React.FocusEvent<HTMLInputElement>) => {
            fnSetFormIsFocused(false)
            iProps.onBlur?.(iEvent)
        }

        const fnHandleChange = (iEvent: React.ChangeEvent<HTMLInputElement>) => {
            fnSetFormHasValue(!!iEvent.target.value)
            iProps.onChange?.(iEvent)
        }

        const LShouldLabelFloat = FormIsFocused || FormHasValue

        return (
            <div className={cn("relative", iClassName)}>
                <input
                    {...iProps}
                    ref={LCombinedRef}
                    className={cn(
                        "peer w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "rounded-md transition-all duration-200 h-12",
                        iError && FormHasValue ? "border-red-400" : "focus:border-primary",
                        iInputClassName,
                    )}
                    placeholder={iLabel}
                    onFocus={fnHandleFocus}
                    onBlur={fnHandleBlur}
                    onChange={fnHandleChange}
                />
                <label
                    htmlFor={iProps.id}
                    className={cn(
                        "absolute left-3 pointer-events-none text-muted-foreground",
                        "transition-all duration-200 ease-out",
                        LShouldLabelFloat ? "-top-2 text-xs bg-background px-1 text-primary" : "top-3.5 text-sm",
                        iError && LShouldLabelFloat && FormHasValue && "text-red-400",
                        iLabelClassName,
                    )}
                >
                    {iLabel}
                </label>
            </div>
        )
    },
)

FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
