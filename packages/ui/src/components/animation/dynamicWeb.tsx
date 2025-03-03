"use client"

import { useEffect, useRef } from "react"

export function DynamicWeb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    let connections: Connection[] = []
    const particleCount = 30
    const connectionDistance = 150
    const colors = [
      "rgba(99, 102, 241, 0.8)", // Indigo
      "rgba(79, 70, 229, 0.8)", // Purple
      "rgba(59, 130, 246, 0.8)", // Blue
      "rgba(16, 185, 129, 0.8)", // Green
    ]

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string

      constructor(x: number, y: number, vx: number, vy: number, radius: number, color: string) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.radius = radius
        this.color = color
      }

      update() {
        if (!canvas) return
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    class Connection {
      p1: Particle
      p2: Particle

      constructor(p1: Particle, p2: Particle) {
        this.p1 = p1
        this.p2 = p2
      }

      update() {}

      draw() {
        if (!ctx) return
        const distance = Math.sqrt(Math.pow(this.p1.x - this.p2.x, 2) + Math.pow(this.p1.y - this.p2.y, 2))
        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance
          ctx.beginPath()
          ctx.moveTo(this.p1.x, this.p1.y)
          ctx.lineTo(this.p2.x, this.p2.y)
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      connections = []

      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 3 + 2
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const vx = (Math.random() - 0.5) * 0.5
        const vy = (Math.random() - 0.5) * 0.5
        const color = colors[Math.floor(Math.random() * colors.length)] ?? "rgba(99, 102, 241, 0.8)"
        particles.push(new Particle(x, y, vx, vy, radius, color))
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          connections.push(new Connection(particles[i]!, particles[j]!))
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      connections.forEach((connection) => {
        connection.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></canvas>
}
