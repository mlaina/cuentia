'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface LoadingImageAnimationProps {
    images: string[]
    maxVisibleImages?: number
}

export default function LoadingImageAnimation ({ images, maxVisibleImages = 5 }: LoadingImageAnimationProps) {
  const [visibleImages, setVisibleImages] = useState<
        Array<{ src: string; scale: number; id: number; position: number }>
    >([])
  const nextIdRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Shuffle array function
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Calculate scale based on position (bell curve)
  const getScaleForPosition = (position: number) => {
    // Maximum scale at position 50 (center)
    // Smaller at both edges (0 and 100)
    const distanceFromCenter = Math.abs(position - 50)
    const maxScale = 1.0 // Maximum scale in the center
    const minScale = 0.3 // Minimum scale at the edges

    // Bell curve formula
    return minScale + (maxScale - minScale) * Math.exp(-(distanceFromCenter * distanceFromCenter) / 500)
  }

  // Calculate opacity based on position
  // Full opacity in center, zero at edges
  const getOpacityForPosition = (position: number) => {
    // Define edge boundaries (0-15% and 85-100% will have zero opacity)
    const edgeThreshold = 15

    if (position <= edgeThreshold) {
      // Left edge: opacity from 0 to 1
      return position / edgeThreshold
    } else if (position >= 100 - edgeThreshold) {
      // Right edge: opacity from 1 to 0
      return (100 - position) / edgeThreshold
    } else {
      // Center area: full opacity
      return 1
    }
  }

  useEffect(() => {
    // Initialize with evenly distributed images without duplicates
    const initialImages = []
    const usedIndices = new Set()

    // Calculate positions to ensure no overlap
    const totalPositions = Math.min(maxVisibleImages, images.length)
    const positionStep = 100 / totalPositions

    for (let i = 0; i < totalPositions; i++) {
      // Find an unused image
      let imageIndex
      do {
        imageIndex = Math.floor(Math.random() * images.length)
      } while (usedIndices.has(imageIndex) && usedIndices.size < images.length)

      usedIndices.add(imageIndex)

      // Position images evenly across the container
      // For 5 images, positions would be: 10, 30, 50, 70, 90
      const position = (i + 0.5) * positionStep

      initialImages.push({
        src: images[imageIndex],
        scale: getScaleForPosition(position),
        id: nextIdRef.current++,
        position
      })
    }

    setVisibleImages(initialImages)

    // Animate using requestAnimationFrame for smoother animation
    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp

      const elapsed = timestamp - lastTimestampRef.current

      // Only update every 50ms for smoother animation
      if (elapsed > 50) {
        lastTimestampRef.current = timestamp

        setVisibleImages((prev) => {
          // Get currently visible image sources
          const visibleSources = new Set(prev.map((img) => img.src))

          // Update all images
          const updated = prev.map((img) => {
            // Move images from right to left slowly
            let newPosition = img.position - 0.5

            // If image moves off the left edge, wrap around to the right
            if (newPosition < 0) {
              newPosition = 100

              // Find an image that's not currently visible
              const availableImages = images.filter((src) => !visibleSources.has(src))

              // If all images are already visible, use the one that just went off-screen
              // Otherwise, pick a random one from available images
              const newSrc =
                                availableImages.length > 0
                                  ? availableImages[Math.floor(Math.random() * availableImages.length)]
                                  : img.src

              return {
                ...img,
                src: newSrc,
                position: newPosition,
                scale: getScaleForPosition(newPosition),
                id: nextIdRef.current++
              }
            }

            // Scale based on position - bell curve with max in center
            const newScale = getScaleForPosition(newPosition)

            return {
              ...img,
              position: newPosition,
              scale: newScale
            }
          })

          // Sort by position for proper rendering order
          return updated.sort((a, b) => a.position - b.position)
        })
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [images, maxVisibleImages])

  // Calculate maximum width for images to prevent overlap
  const calculateMaxWidth = (scale: number, totalImages: number) => {
    // Ensure images don't overlap by limiting their width
    // The maximum width depends on the number of images and their scale
    const baseWidth = 20 // Base width percentage
    return baseWidth * scale
  }

  return (
        <div className='flex flex-col items-center justify-center w-full h-full'>
            <div
              ref={containerRef}
              className='relative w-full max-w-[700px] h-[500px] flex flex-col justify-center items-center overflow-hidden mx-auto'
            >
                {visibleImages.map((image) => {
                  // Calculate width based on scale and number of images
                  const maxWidth = calculateMaxWidth(image.scale, visibleImages.length)

                  // Calculate opacity based on position
                  const opacity = getOpacityForPosition(image.position)

                  return (
                        <div
                          key={image.id}
                          className='absolute transition-all duration-300 ease-out'
                          style={{
                            width: `${maxWidth}%`,
                            height: `${image.scale * 60}%`,
                            left: `${image.position}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity
                          }}
                        >
                            <div className='relative w-full h-full rounded-lg overflow-hidden shadow-lg'>
                                <Image
                                  src={image.src || '/placeholder.svg'}
                                  alt='Loading image'
                                  fill
                                  sizes='(max-width: 768px) 30vw, 20vw'
                                  className='object-cover'
                                />
                            </div>
                        </div>
                  )
                })}
            </div>
        </div>
  )
}
