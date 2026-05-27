import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const viewport = window.innerHeight
    const all = document.querySelectorAll('.reveal')

    all.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top < viewport * 0.9) {
        el.classList.add('in')
      } else {
        el.classList.add('will-animate')
      }
    })

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
    )

    document.querySelectorAll('.reveal.will-animate:not(.in)').forEach(el => io.observe(el))

    return () => io.disconnect()
  }, [])
}
