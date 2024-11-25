'use client'

import React, { useEffect, useRef } from 'react'

const AnimatedParticlesBackground: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const width = window.innerWidth
    const height = window.innerHeight

    // Mantener el número de partículas
    const particleCount = 300
    const colors = ['#93c5fd', '#d8b4fe', '#fca5a5', '#f9a8d4'] // sky-300, purple-300, red-300, pink-300

    for (let i = 0; i < particleCount; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('r', (Math.random() * 3 + 1).toString()) // Aumentar el tamaño de las partículas
      circle.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)])

      const startX = Math.random() * width
      const startY = Math.random() * height
      circle.setAttribute('cx', startX.toString())
      circle.setAttribute('cy', startY.toString())

      const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion')
      const path = generateRandomPath(width, height)
      animateMotion.setAttribute('path', path)
      animateMotion.setAttribute('dur', `${Math.random() * 60 + 40}s`)
      animateMotion.setAttribute('repeatCount', 'indefinite')

      circle.appendChild(animateMotion)
      svg.appendChild(circle)
    }

    // Limpiar las partículas cuando el componente se desmonte
    return () => {
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }
    }
  }, [])

  // Función para generar un path aleatorio
  const generateRandomPath = (width: number, height: number): string => {
    const points = []
    const numPoints = Math.floor(Math.random() * 3) + 3 // 3 a 5 puntos
    for (let i = 0; i < numPoints; i++) {
      points.push(`${Math.random() * width},${Math.random() * height}`)
    }
    return `M${points.join(' L')} Z`
  }

  return (
        <div className='fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-sky-200 to-pink-100'>
            <svg
              ref={svgRef}
              className='absolute w-full h-full'
              xmlns='http://www.w3.org/2000/svg'
            />
        </div>
  )
}

export default AnimatedParticlesBackground
