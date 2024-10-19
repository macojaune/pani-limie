import { useState, useEffect } from "react"

const useRelativeTime = (date: string | Date) => {
  const [relativeTime, setRelativeTime] = useState("")
  useEffect(() => {
    const updateRelativeTime = () => {
      const now = new Date()
      const d = new Date(date)
      const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)

      const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" })
      setRelativeTime(rtf.format(-Math.round(diffInHours), "hour"))
    }

    updateRelativeTime()
    const timer = setInterval(updateRelativeTime, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [date])

  return relativeTime
}

export default useRelativeTime
