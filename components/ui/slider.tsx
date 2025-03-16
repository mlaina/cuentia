'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
    >(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
        <SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-gray-500'>
            <SliderPrimitive.Range className='absolute h-full bg-secondary ' />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className='block shadow-md  h-5 w-5 rounded-full border-2 border-purple-200 bg-white shadow-md ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:scale-110 disabled:pointer-events-none disabled:opacity-50' />
    </SliderPrimitive.Root>
    ))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
