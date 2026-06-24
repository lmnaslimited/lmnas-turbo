import type { AnchorHTMLAttributes, ReactNode } from "react"

type TmockNextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    children: ReactNode
}

export default function Link({ children, href, ...idProps }: TmockNextLinkProps) {
    return <a href={href} {...idProps}>{children}</a>
}
