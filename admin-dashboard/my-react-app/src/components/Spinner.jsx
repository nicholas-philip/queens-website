import { cn } from "../libs/utils"
 
export default function Spinner({ size = "md", className }) {
  const s = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-10 w-10" }
  return <div className={cn("animate-spin rounded-full border-2 border-base-300 border-t-primary", s[size], className)} />
}