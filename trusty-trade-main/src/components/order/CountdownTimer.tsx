import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  endTime: Date
  onExpire: () => void
  warningThreshold?: number // hours
  format?: 'full' | 'compact'
  className?: string
}

export const CountdownTimer = ({ 
  endTime, 
  onExpire, 
  warningThreshold = 24, 
  format = 'full',
  className 
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
        onExpire()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, total: difference })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime, onExpire])

  const totalHours = Math.floor(timeLeft.total / (1000 * 60 * 60))
  const isWarning = totalHours <= warningThreshold && totalHours > 0
  const isExpired = timeLeft.total <= 0

  if (isExpired) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Clock className="h-4 w-4" />
        <span className="text-sm">Verification period expired</span>
      </div>
    )
  }

  const formatTime = () => {
    if (format === 'compact') {
      if (timeLeft.days > 0) {
        return `${timeLeft.days}d ${timeLeft.hours}h`
      } else if (timeLeft.hours > 0) {
        return `${timeLeft.hours}h ${timeLeft.minutes}m`
      } else {
        return `${timeLeft.minutes}m ${timeLeft.seconds}s`
      }
    }

    const parts = []
    if (timeLeft.days > 0) parts.push(`${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}`)
    if (timeLeft.hours > 0) parts.push(`${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}`)
    if (timeLeft.days === 0 && timeLeft.minutes > 0) parts.push(`${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}`)
    if (timeLeft.days === 0 && timeLeft.hours === 0) parts.push(`${timeLeft.seconds} second${timeLeft.seconds !== 1 ? 's' : ''}`)

    return parts.join(', ')
  }

  return (
    <div className={cn(
      'flex items-center gap-2',
      isWarning ? 'text-warning' : 'text-muted-foreground',
      className
    )}>
      {isWarning ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span className={cn(
        'text-sm font-medium',
        isWarning && 'animate-pulse'
      )}>
        {formatTime()} remaining
      </span>
    </div>
  )
}