'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface UseScrollRevealOptions {
  threshold?: number
  once?: boolean
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    once = true,
    delay = 0,
    direction = 'up'
  } = options

  const [ref, inView] = useInView({
    threshold,
    triggerOnce: once,
  })

  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [inView, hasAnimated])

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 60 }
      case 'down': return { opacity: 0, y: -60 }
      case 'left': return { opacity: 0, x: 60 }
      case 'right': return { opacity: 0, x: -60 }
      case 'none': return { opacity: 0 }
      default: return { opacity: 0, y: 60 }
    }
  }

  const getAnimatePosition = () => {
    switch (direction) {
      case 'up': return { opacity: 1, y: 0 }
      case 'down': return { opacity: 1, y: 0 }
      case 'left': return { opacity: 1, x: 0 }
      case 'right': return { opacity: 1, x: 0 }
      case 'none': return { opacity: 1 }
      default: return { opacity: 1, y: 0 }
    }
  }

  return {
    ref,
    inView,
    hasAnimated,
    initial: getInitialPosition(),
    animate: getAnimatePosition(),
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
      delay
    }
  }
}

// Stagger children animation helper
export function useStaggeredReveal(itemCount: number, options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, once = true } = options
  
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: once,
  })

  return {
    ref,
    inView,
    containerTransition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    },
    getItemTransition: (index: number) => ({
      duration: 0.6,
      delay: index * 0.1,
      ease: [0.25, 0.1, 0.25, 1]
    })
  }
}

// Parallax hook
export function useParallax(offset: number = 50) {
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY * offset)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [offset])

  return offsetY
}

// Counter animation hook
export function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!start) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration, start])

  return count
}
