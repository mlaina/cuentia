import { useEffect, useRef, useState } from 'react'

export default function AutoResizeText ({ children }) {
  const containerRef = useRef(null)
  const [fontSize, setFontSize] = useState(20) // tamaño inicial

  useEffect(() => {
    const resizeText = () => {
      const container = containerRef.current
      if (!container) return

      let currentSize = fontSize
      container.style.fontSize = `${currentSize}px`

      // Reducir tamaño hasta que no haya overflow
      while (container.scrollHeight > container.clientHeight && currentSize > 10) {
        currentSize -= 1
        container.style.fontSize = `${currentSize}px`
      }

      setFontSize(currentSize)
    }

    const observer = new ResizeObserver(resizeText)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [fontSize])

  return (
        <div
          ref={containerRef}
          className='overflow-hidden h-[300px] transition-all'
          style={{ fontSize: `${fontSize + 4}px` }}
        >
            {children}
        </div>
  )
}
