import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

export function getIconComponent(name: string): LucideIcon {
  const Icon = Icons[name as keyof typeof Icons]
  return (Icon as LucideIcon) || Icons.HelpCircle
}
