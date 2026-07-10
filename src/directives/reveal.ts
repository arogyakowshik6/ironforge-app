import type { App, Directive } from 'vue'

const revealDirective: Directive<HTMLElement> = {
  mounted(el) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    el.classList.add('reveal-init')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-in')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
  },
}

export function installReveal(app: App) {
  app.directive('reveal', revealDirective)
}
