import { useState, useEffect } from "react"

const useRelativeTime = (date: string | Date) => {
  const [relativeTime, setRelativeTime] = useState("")
  useEffect(() => {
    const updateRelativeTime = () => {
      const now = new Date()
      const d = new Date(date)
      const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
      const diffInMinutes = (now.getTime() - d.getTime()) / (1000 * 60)

      const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto", style: "short" })
      if (diffInHours <= 1) {
        setRelativeTime(rtf.format(-Math.round(diffInMinutes), "minute"))
      } else {
        setRelativeTime(rtf.format(-Math.round(diffInHours), "hour"))
      }
    }

    updateRelativeTime()
    const timer = setInterval(updateRelativeTime, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [date])

  return relativeTime
}

export default useRelativeTime
