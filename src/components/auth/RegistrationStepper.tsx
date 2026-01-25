"use client"

interface Step {
  number: number
  label: string
}

interface RegistrationStepperProps {
  currentStep: number
  steps?: Step[]
}

const defaultSteps: Step[] = [
  { number: 1, label: "기본 정보" },
  { number: 2, label: "동문 인증" },
  { number: 3, label: "퀴즈" },
  { number: 4, label: "완료" },
]

export default function RegistrationStepper({
  currentStep,
  steps = defaultSteps,
}: RegistrationStepperProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  currentStep > step.number
                    ? "bg-green-500 text-white"
                    : currentStep === step.number
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-300"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > step.number ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep >= step.number
                    ? "text-violet-600"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 rounded transition-all duration-300 ${
                  currentStep > step.number ? "bg-green-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
