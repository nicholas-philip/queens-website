import { cn, formatCurrency, growthColor, growthArrow } from "../../libs/utils"

export default function StatCard({ title, value, icon: Icon, color = "yellow", growth, isCurrency, suffix }) {
  const bg = {
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    green:  "bg-green-500/10 text-green-500 border-green-500/20",
    blue:   "bg-blue-500/10 text-blue-500 border-blue-500/20",
    red:    "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const displayValue = isCurrency ? formatCurrency(value) : `${Number(value || 0).toLocaleString()}${suffix || ""}`

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl animate-fade-in relative overflow-hidden group">
      {/* Decorative gradient mask */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{displayValue}</p>
          {growth !== undefined && (
            <p className={cn("text-xs font-bold mt-2 flex items-center gap-1", growthColor(growth))}>
              <span className="flex items-center">
                {growthArrow(growth)} {Math.abs(growth)}%
              </span>
              <span className="text-neutral-600 font-medium lowercase">vs last month</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110", bg[color])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}