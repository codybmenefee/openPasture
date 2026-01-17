import type { ReactNode } from 'react'
import { StepIndicator } from './StepIndicator'

interface OnboardingContainerProps {
  steps: string[]
  currentStep: number
  children: ReactNode
}

export function OnboardingContainer({ 
  steps, 
  currentStep, 
  children 
}: OnboardingContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with step indicator */}
      <header className="border-b py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <StepIndicator steps={steps} currentStep={currentStep} />
          <span className="text-sm text-muted-foreground">
            {steps[currentStep]}
          </span>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  )
}
