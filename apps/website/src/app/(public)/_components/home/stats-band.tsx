'use client'

import * as React from 'react'

import { STATS } from '@/config/site'

const useCountUp = (target: number, run: boolean, duration = 1500) => {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!run) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, run, duration])

  return value
}

const Stat = ({
  value,
  suffix,
  label,
  run,
}: {
  value: number
  suffix: string
  label: string
  run: boolean
}) => {
  const count = useCountUp(value, run)
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-brand-gold font-display text-4xl font-bold md:text-5xl">
        {count}
        {suffix}
      </span>
      <span className="mt-2 text-sm text-white/80 md:text-base">{label}</span>
    </div>
  )
}

export const StatsBand = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [run, setRun] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRun(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-brand-brown px-6 py-14 md:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat) => (
          <Stat
            key={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            run={run}
          />
        ))}
      </div>
    </section>
  )
}
