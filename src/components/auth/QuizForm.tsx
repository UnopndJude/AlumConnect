"use client"

import { useState } from "react"
import { QuizQuestionPublic } from "@/types/quiz"

interface QuizFormProps {
  questions: QuizQuestionPublic[]
  attemptCount: number
  maxAttempts: number
  onSubmit: (answers: number[]) => Promise<void>
  isLoading: boolean
}

export default function QuizForm({
  questions,
  attemptCount,
  maxAttempts,
  onSubmit,
  isLoading,
}: QuizFormProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  )

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (answers.some((a) => a === null)) {
      return
    }
    await onSubmit(answers as number[])
  }

  const allAnswered = answers.every((a) => a !== null)
  const remainingAttempts = maxAttempts - attemptCount

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">동문 인증 퀴즈</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">남은 시도:</span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              remainingAttempts > 1
                ? "bg-green-100 text-green-700"
                : remainingAttempts === 1
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {remainingAttempts}회
          </span>
        </div>
      </div>

      <p className="mb-8 text-slate-600">
        인천과학고등학교에 대한 퀴즈입니다. 5문제 중 4문제 이상 맞추셔야 합니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-6"
          >
            <div className="mb-4 flex items-start gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
                {qIndex + 1}
              </span>
              <p className="pt-1 text-lg font-medium text-slate-800">
                {question.question}
              </p>
            </div>

            <div className="ml-12 grid grid-cols-1 gap-3 md:grid-cols-2">
              {question.options.map((option, oIndex) => (
                <label
                  key={oIndex}
                  className={`flex cursor-pointer items-center rounded-lg p-4 transition-all duration-200 ${
                    answers[qIndex] === oIndex
                      ? "border-2 border-violet-500 bg-violet-100 shadow-sm"
                      : "border-2 border-slate-200 bg-white hover:border-violet-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={oIndex}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswerSelect(qIndex, oIndex)}
                    className="sr-only"
                  />
                  <span
                    className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      answers[qIndex] === oIndex
                        ? "border-violet-500 bg-violet-500"
                        : "border-slate-300"
                    }`}
                  >
                    {answers[qIndex] === oIndex && (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-500">
            {allAnswered
              ? "모든 문제에 답변하셨습니다."
              : `${answers.filter((a) => a !== null).length}/${questions.length} 문제 답변 완료`}
          </p>

          <button
            type="submit"
            disabled={!allAnswered || isLoading}
            className="btn btn-primary px-8 py-3"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                채점 중...
              </div>
            ) : (
              "제출하기"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
