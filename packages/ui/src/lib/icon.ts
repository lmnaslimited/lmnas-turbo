import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

export function fnGetIconComponent(iname: string): LucideIcon {
  const LIcon = Icons[iname as keyof typeof Icons]
  return (LIcon as LucideIcon) || Icons.HelpCircle
}
