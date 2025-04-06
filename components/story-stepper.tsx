'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepStatus = 'pending' | 'current' | 'completed'

export interface Step {
    id: string
    label: string
    status: StepStatus
    progress?: {
        current: number
        total: number
    }
}

interface StoryStepperProps {
    steps: Step[]
    currentStepId: string
    onStepComplete?: (stepId: string) => void
}

export default function StoryStepper ({ steps, currentStepId, onStepComplete }: StoryStepperProps) {
  const [activeSteps, setActiveSteps] = useState<Step[]>(steps)

  useEffect(() => {
    // Update steps when currentStepId changes
    setActiveSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        status:
                    step.id === currentStepId
                      ? 'current'
                      : steps.findIndex((s) => s.id === step.id) < steps.findIndex((s) => s.id === currentStepId)
                        ? 'completed'
                        : 'pending'
      }))
    )
  }, [currentStepId, steps])

  return (
        <div className='w-full max-w-3xl mx-auto my-8'>
            <div className='relative'>
                {/* Progress bar background */}
                <div className='absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full' />

                {/* Active progress bar */}
                <div
                  className='absolute top-5 left-0 h-1 bg-secondary rounded-full transition-all duration-500 ease-in-out'
                  style={{
                    width: `${Math.max((steps.findIndex((step) => step.id === currentStepId) / (steps.length - 1)) * 100, 0)}%`
                  }}
                />

                {/* Steps */}
                <div className='relative flex justify-between'>
                    {activeSteps.map((step, index) => (
                        <div key={step.id} className='flex flex-col items-center'>
                            <div
                              className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300',
                                step.status === 'completed'
                                  ? 'border-secondary bg-secondary text-secondary-foreground'
                                  : step.status === 'current'
                                    ? 'border-secondary bg-white text-secondary'
                                    : 'border-gray-300 bg-white text-gray-300'
                              )}
                            >
                                {step.status === 'completed'
                                  ? (
                                    <CheckCircle className='w-5 h-5 text-white' />
                                    )
                                  : (
                                    <span className='text-sm font-medium'>{index + 1}</span>
                                    )}
                            </div>

                            {/* Step label */}
                            <div className='mt-2 text-center'>
                                <p
                                  className={cn(
                                    'text-sm font-medium',
                                    step.status === 'completed'
                                      ? 'text-secondary'
                                      : step.status === 'current'
                                        ? 'text-secondary'
                                        : 'text-gray-500'
                                  )}
                                >
                                    {step.label}
                                </p>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
  )
}
